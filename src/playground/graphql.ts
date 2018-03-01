import * as express from 'express';
import * as bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { userDefinedTypes } from './user-defined-types';
import { resolvers, ICtx } from './resolvers'
import { driver, session } from './neo4j'
import { userDefinedTypesToGraphexSchema } from '../lib/graphex-schema/index'
import { attachCrudOperations } from '../lib/extend-user-defined-types/crud';
import { buildResolvers } from '../lib/cypher/build-resolver'
import { parse, GraphQLSchema } from 'graphql'
import { CustomSchemaPlugin } from '../lib/plugins/custom'
import { mergeSchemas } from 'graphql-tools';
import { BaseSchemaPlugin } from '../lib/plugins/base';
import { CrudSchemaPlugin } from '../lib/plugins/crud';

const graphexSchema = userDefinedTypesToGraphexSchema(userDefinedTypes)
const typeDefs = attachCrudOperations(userDefinedTypes, graphexSchema)

const customPluginSchema = new CustomSchemaPlugin(userDefinedTypes)
const baseSchemaPlugin = new BaseSchemaPlugin(userDefinedTypes)
const crudSchemaPlugin = new CrudSchemaPlugin(userDefinedTypes)

export const schema: GraphQLSchema = mergeSchemas({
  schemas: [baseSchemaPlugin.getSchema(), customPluginSchema.getSchema(), crudSchemaPlugin.getSchema()],
});

export const app: express.Express = express();

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
