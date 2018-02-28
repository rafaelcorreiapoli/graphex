import { GraphQLServer } from 'graphql-yoga'
import { userDefinedTypes } from './user-defined-types';
import { resolvers } from './resolvers';
import { driver, session } from './neo4j'
import { userDefinedTypesToGraphexSchema } from '../lib/graphex-schema/index'
import { attachCrudOperations } from '../lib/extend-user-defined-types/crud';

const graphexSchema = userDefinedTypesToGraphexSchema(userDefinedTypes)
const typeDefs = attachCrudOperations(userDefinedTypes, graphexSchema)
console.log(typeDefs)
export const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: {
    driver,
    session,
  },
})
