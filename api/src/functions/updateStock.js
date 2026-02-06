const { app } = require('@azure/functions');
const { requestsContainer, productsContainer, stockMovementsContainer } = require('../../shared/cosmosClient');

app.http('updateStock', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { requestId } = body;

            // Transact-like behavior is hard across containers in Cosmos without checking partition keys carefully.
            // We will do sequential updates for this MVP.

            const { resource: order } = await requestsContainer.item(requestId, requestId).read();

            if (!order || order.status !== 'Approved') {
                return { status: 400, jsonBody: { error: "Request not eligible for delivery" } };
            }

            // Update Products and Create Stock Movements
            const movements = [];

            for (const line of order.lines) {
                const { productId, qty } = line;

                // Read product
                const { resource: product } = await productsContainer.item(productId, productId).read();

                if (product) {
                    product.qtyPhysical = (product.qtyPhysical || 0) - qty;
                    // Optimistic concurrency check could be added here (etag)
                    await productsContainer.item(productId, productId).replace(product);

                    movements.push({
                        id: crypto.randomUUID(),
                        productId,
                        delta: -qty,
                        requestId,
                        userId: order.userId, // Who received it? or who requested?
                        date: new Date().toISOString(),
                        comment: "Livraison demande " + requestId
                    });
                }
            }

            // Bulk create movements (or loop)
            for (const m of movements) {
                // Movements partitioned by requestId potentially?? 
                // Schema said: StockMovement: { id, productId, delta, requestId, userId, date, comment }
                // Partition key in Bicep was requestId? Let's check. Yes.
                await stockMovementsContainer.items.create(m);
            }

            // Update Request Status
            order.status = 'Delivered';
            const { resource: updatedOrder } = await requestsContainer.item(requestId, requestId).replace(order);

            return { jsonBody: updatedOrder };

        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { error: "Failed to update stock" } };
        }
    }
});
