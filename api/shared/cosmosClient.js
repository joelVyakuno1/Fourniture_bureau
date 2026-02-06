const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const client = new CosmosClient(connectionString);
const database = client.database("OfficeSupplyDB");

module.exports = {
    client,
    database,
    requestsContainer: database.container("Requests"),
    productsContainer: database.container("Products"),
    stockMovementsContainer: database.container("StockMovements")
};
