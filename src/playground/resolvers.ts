import Session from 'neo4j-driver/types/v1/session';
import { log } from '../lib/common/string';
// import { insertNode, getNodesByLabel, getNodeById, linkNodes, unlinkNodes, getRelations } from './diplomat'
import { codeGenerator } from '../lib/cypher/cypher-compiler'
import { Driver } from 'neo4j-driver/types/v1';
import { GraphQLResolveInfo } from 'graphql';

export interface ICtx {
  driver: Driver
}

export enum ReturnType {
  ARRAY = 'array',
  OBJECT = 'object',
}

export const resolvers = {
  Organization: {
    name: () => 'porra'
  },
  Query: {
    allTechnologies: (value, args, ctx: ICtx, info) => {
      log(info)
    },
    organization: (value, args, ctx, info) => null,
    allOrganizations: (value, args, ctx: ICtx, info) => {
      return []
    },
    technology: async (value, params, ctx: ICtx, info: GraphQLResolveInfo): Promise<any> => {
      const cypherQuery = codeGenerator(params, info)

      const returnType: ReturnType = info.returnType.toString().charAt(0) === '[' ? ReturnType.ARRAY : ReturnType.OBJECT

      const session = ctx.driver.session()
      const result = await session.run(cypherQuery)
      const variable = info.fieldName

      switch (returnType) {
        case ReturnType.ARRAY:
          return result.records.map((record) => record.get(variable))
        case ReturnType.OBJECT:
          if (result.records.length > 0) {
            // FIXME: use one of the new neo4j-driver consumers when upgrading neo4j-driver package
            return result.records[0].get(variable);
          } else {
            return null;
          }
      }
    },
  },
  Mutation: {
    addTechnology: (_, { input }, ctx: ICtx) => {
      // return insertNode(ctx.session, 'Technology', input)
    },
    addOrganization: (_, { input }, ctx: ICtx) => {
      // return insertNode(ctx.session, 'Organization', input)
    },
    deleteTechnology: () => null,
    deleteOrganization: () => null,
    editTechnology: () => null,
    editOrganization: () => null,
    // linkNodes: (_, { input }, ctx: ICtx) => {
    //   const { nodeA, nodeB } = input
    //   // return linkNodes(session, nodeA, nodeB, 'MyRelation')
    // },
    // unlinkNodes: (_, { input }, ctx: ICtx) => {
    //   const { nodeA, nodeB } = input
    //   // return unlinkNodes(session, nodeA, nodeB, 'MyRelation')
    // },
  },
}
