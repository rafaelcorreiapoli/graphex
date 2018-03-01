import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

export const getExecutor = (typeDefs: string, resolversGetter) => {
  return (query: string, variables: any): Promise<any> => new Promise(async (resolve, reject) => {
    const resolvers = resolversGetter((_, params, __, info) => resolve({ params, info }))
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    // const myCtx = { driver }

    graphql(schema, query, null, {}, variables)
  })
}
