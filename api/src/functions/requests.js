const { app } = require('@azure/functions');
const { requestsContainer, productsContainer, stockMovementsContainer } = require('../shared/cosmosClient');

// Helper to update status
async function updateStatus(id, status, comment, userId, context) {
    const itemRef = requestsContainer.item(id, id);
    const { resource: request } = await itemRef.read();

    if (!request) throw new Error("Request not found");

    request.status = status;
    if (comment) request.managerComment = comment;
    // Track who did it if needed, e.g. request.approvedBy = userId

    await itemRef.replace(request);
    return request;
}

app.http('getRequests', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'requests',
    handler: async (req, context) => {
        const userId = req.query.get('userId');
        const managerId = req.query.get('managerId');

        let querySpec;
        if (userId) {
            querySpec = {
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            };
        } else if (managerId) {
            querySpec = {
                query: "SELECT * FROM c WHERE c.managerId = @managerId", // AND status = 'PendingApproval' maybe?
                parameters: [{ name: "@managerId", value: managerId }]
            };
        } else {
            querySpec = { query: "SELECT * FROM c" };
        }

        try {
            const { resources } = await requestsContainer.items.query(querySpec).fetchAll();
            return { jsonBody: resources };
        } catch (e) {
            context.error(e);
            return { status: 500, body: e.message };
        }
    }
});

app.http('createRequest', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'requests',
    handler: async (req, context) => {
        try {
            const body = await req.json();
            // body: { id? (if update), userId, lines, status }

            if (body.id) {
                // Update existing (e.g. draft autosave)
                const itemRef = requestsContainer.item(body.id, body.id);
                const { resource: existing } = await itemRef.read();
                if (existing) {
                    const updated = { ...existing, ...body, created: existing.created }; // prevent overwrite created date
                    await itemRef.replace(updated);
                    return { jsonBody: updated };
                }
            }

            // Create new
            const newRequest = {
                id: body.id || crypto.randomUUID(),
                userId: body.userId,
                managerId: body.managerId, // Should be resolved from user hierarchy
                created: new Date().toISOString(),
                status: body.status || 'Draft',
                lines: body.lines || [],
                totalQty: (body.lines || []).reduce((acc, l) => acc + l.qty, 0)
            };

            await requestsContainer.items.create(newRequest);
            return { jsonBody: newRequest };

        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error creating request" };
        }
    }
});

app.http('approveRequest', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'requests/{id}/approve',
    handler: async (req, context) => {
        const id = req.params.id;
        const body = await req.json(); // { comment, userId }
        try {
            const updated = await updateStatus(id, 'Approved', body.comment, body.userId, context);
            return { jsonBody: updated };
        } catch (e) {
            return { status: 404, body: e.message };
        }
    }
});

app.http('rejectRequest', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'requests/{id}/reject',
    handler: async (req, context) => {
        const id = req.params.id;
        const body = await req.json();
        try {
            const updated = await updateStatus(id, 'Rejected', body.comment, body.userId, context);
            return { jsonBody: updated };
        } catch (e) {
            return { status: 404, body: e.message };
        }
    }
});

app.http('deliverRequest', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'requests/{id}/deliver',
    handler: async (req, context) => {
        const id = req.params.id;
        const body = await req.json(); // { userId }

        try {
            const itemRef = requestsContainer.item(id, id);
            const { resource: request } = await itemRef.read();

            if (!request) return { status: 404, body: "Request not found" };
            if (request.status === 'Delivered') return { status: 400, body: "Already delivered" };

            // Decrement stocks
            for (const line of request.lines) {
                const prodRef = productsContainer.item(line.productId, line.productId);
                const { resource: product } = await prodRef.read();

                if (product) {
                    const oldQty = product.qtyPhysical;
                    product.qtyPhysical = Math.max(0, product.qtyPhysical - line.qty);
                    await prodRef.replace(product);

                    // Log movement
                    await stockMovementsContainer.items.create({
                        id: crypto.randomUUID(),
                        productId: line.productId,
                        delta: -line.qty,
                        requestId: id,
                        userId: body.userId || 'secretariat',
                        date: new Date().toISOString(),
                        comment: 'Delivery'
                    });
                }
            }

            request.status = 'Delivered';
            await itemRef.replace(request);

            return { jsonBody: request };

        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error delivering request" };
        }
    }
});
