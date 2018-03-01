import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

export const getExecutor = (typeDefs: string) => {
  return (query: string, variables: any): Promise<any> => new Promise(async (resolve, reject) => {
    const resolvers = {
      Query: {
        allTechnologies: (...args) => {
          resolve(args)
        },
        technology: (...args) => {
          resolve(args)
        },
    }};

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    graphql(schema, query, null, null, variables)
    .then((data) => {

    })
  })
}
