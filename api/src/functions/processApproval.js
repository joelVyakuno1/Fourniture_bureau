const { app } = require('@azure/functions');
const { requestsContainer } = require('../../shared/cosmosClient');

app.http('processApproval', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { requestId, status, managerComment, managerId } = body;
            // status should be 'Approved' or 'Rejected'

            if (!['Approved', 'Rejected'].includes(status)) {
                return { status: 400, jsonBody: { error: "Invalid status" } };
            }

            const { resource: existingRequest } = await requestsContainer.item(requestId, requestId).read();

            if (!existingRequest) {
                return { status: 404, jsonBody: { error: "Request not found" } };
            }

            // Check authorization if needed (managerId match)

            existingRequest.status = status;
            existingRequest.managerComment = managerComment;
            existingRequest.managerActionDate = new Date().toISOString();

            const { resource: updatedRequest } = await requestsContainer.item(requestId, requestId).replace(existingRequest);

            // TODO: Generate Teams Card JSON snippet here if needed for notification output

            return { jsonBody: updatedRequest };

        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { error: "Failed to process approval" } };
        }
    }
});
