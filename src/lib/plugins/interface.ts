import { GraphQLSchema } from 'graphql';

export interface ISchemaPlugin {
  getSchema: () => GraphQLSchema
}
