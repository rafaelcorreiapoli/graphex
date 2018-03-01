import * as express from 'express';
import * as bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { userDefinedTypes } from './user-defined-types';
import { GraphQLSchema } from 'graphql'
import { CustomSchemaPlugin } from '../lib/plugins/custom'
import { BaseSchemaPlugin } from '../lib/plugins/base';
import { CrudSchemaPlugin } from '../lib/plugins/crud';
import { mergeSchemas } from 'graphql-tools';
import { Neo4jOperationExecutor } from './neo4j-executor';
import { driver } from './neo4j'

const neo4jOperationExecutor = new Neo4jOperationExecutor()

const customPluginSchema = new CustomSchemaPlugin(userDefinedTypes)
const baseSchemaPlugin = new BaseSchemaPlugin(userDefinedTypes)
const crudSchemaPlugin = new CrudSchemaPlugin(userDefinedTypes, neo4jOperationExecutor)

export const schema: GraphQLSchema = mergeSchemas({
  schemas: [baseSchemaPlugin.getSchema(), customPluginSchema.getSchema(), crudSchemaPlugin.getSchema()],
});

export const app: express.Express = express();

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, context: {
  driver,
} }));
app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
