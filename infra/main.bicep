param location string = resourceGroup().location
param appName string = 'officesupply-${uniqueString(resourceGroup().id)}'

// Cosmos DB Account
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: '${appName}-cosmos'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
  }
}

// Cosmos DB Database
resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-11-15' = {
  parent: cosmosAccount
  name: 'OfficeSupplyDB'
  properties: {
    resource: {
      id: 'OfficeSupplyDB'
    }
  }
}

// Containers
resource requestsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: database
  name: 'Requests'
  properties: {
    resource: {
      id: 'Requests'
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
    }
  }
}

resource productsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: database
  name: 'Products'
  properties: {
    resource: {
      id: 'Products'
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
    }
  }
}

resource stockMovementsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: database
  name: 'StockMovements'
  properties: {
    resource: {
      id: 'StockMovements'
      partitionKey: {
        paths: ['/requestId']
        kind: 'Hash'
      }
    }
  }
}

// Static Web App
resource swa 'Microsoft.Web/staticSites@2023-01-01' = {
  name: '${appName}-swa'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    repositoryUrl: 'https://github.com/placeholder/repo' // To be updated during deployment config
    branch: 'main'
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

// Outputs
output swaName string = swa.name
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
