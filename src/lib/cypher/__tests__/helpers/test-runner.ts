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

/*

          const [value, params, ctx, info] = args
          const returnType = info.returnType.toString().startsWith("[") ? 'array' : 'object'

          const session = ctx.driver.session()
          const cypherQuery = codeGenerator(params, info)
          const result = await session.run(cypherQuery)
          if (returnType === 'array') {
            return result.records.map((record) => record.get('technology'))
          } else if (returnType === 'object') {
            if (result.records.length > 0) {
              // FIXME: use one of the new neo4j-driver consumers when upgrading neo4j-driver package
              return result.records[0].get('technology');
            } else {
              return null;
            }
          }

          return data;
*/
