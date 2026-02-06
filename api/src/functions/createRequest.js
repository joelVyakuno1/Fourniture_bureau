const { app } = require('@azure/functions');
const { requestsContainer, productsContainer } = require('../../shared/cosmosClient');
const { v4: uuidv4 } = require('uuid'); // Native node crypto in v20 or polyfill, but assuming v20 has crypto.randomUUID. using minimal id gen for now or rely on crypto.
// Cosmos SDK usually auto-generates ID if missing, but we want to return it.
// Node v20 has crypto.randomUUID()

app.http('createRequest', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { userId, managerId, lines } = body;

            if (!lines || lines.length === 0) {
                return { status: 400, jsonBody: { error: "No lines in request" } };
            }

            // Simple validation of stock levels could happen here or optimistic concurrency on client

            const newRequest = {
                id: crypto.randomUUID(),
                userId,
                managerId,
                created: new Date().toISOString(),
                status: "Pending", // "En attente d'approbation"
                lines
            };

            const { resource: createdItem } = await requestsContainer.items.create(newRequest);

            return { status: 201, jsonBody: createdItem };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { error: "Failed to create request" } };
        }
    }
});
