const { app } = require('@azure/functions');
const { productsContainer, stockMovementsContainer } = require('../shared/cosmosClient');

app.http('getProducts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'products',
    handler: async (request, context) => {
        try {
            const { resources: products } = await productsContainer.items.readAll().fetchAll();
            return { jsonBody: products };
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error retrieving products" };
        }
    }
});

app.http('updateProductQty', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'products/{id}/qty',
    handler: async (request, context) => {
        const id = request.params.id;
        let body;
        try {
            body = await request.json();
        } catch (err) {
            return { status: 400, body: "Invalid JSON" };
        }

        const { delta, comment, userId } = body;

        if (delta === undefined) {
            return { status: 400, body: "Missing delta" };
        }

        try {
            // Cosmos DB item operations require partition key. Assuming id is partition key or default.
            // If partitioned by 'category' or other, we need it. 
            // In implementation_plan we didn't specify PK. Default is often /id.
            const itemRef = productsContainer.item(id, id);
            const { resource: product, statusCode } = await itemRef.read();

            if (statusCode === 404 || !product) {
                return { status: 404, body: 'Product not found' };
            }

            product.qtyPhysical = (product.qtyPhysical || 0) + delta;

            await itemRef.replace(product);

            // Log movement
            await stockMovementsContainer.items.create({
                id: crypto.randomUUID(),
                productId: id,
                delta: delta,
                requestId: null,
                userId: userId || 'system',
                date: new Date().toISOString(),
                comment: comment || 'Manual adjustment'
            });

            return { jsonBody: product };
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error updating product" };
        }
    }
});
