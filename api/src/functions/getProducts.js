const { app } = require('@azure/functions');
const { productsContainer } = require('../../shared/cosmosClient');

app.http('getProducts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const { resources: products } = await productsContainer.items.readAll().fetchAll();
            return { jsonBody: products };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { error: "Failed to retrieve products" } };
        }
    }
});
