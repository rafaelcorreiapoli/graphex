import Session from 'neo4j-driver/types/v1/session';
import { log } from '../lib/common/string';
// import { insertNode, getNodesByLabel, getNodeById, linkNodes, unlinkNodes, getRelations } from './diplomat'

export interface ICtx {
  session: Session
}
export const resolvers = {
  Query: {
    allTechnologies: (value, args, ctx: ICtx, info) => {
      log(info)
    },
    organization: (value, args, ctx, info) => null,
    allOrganizations: (value, args, ctx: ICtx, info) => {
      return []
    },
    technology: (_, { id }, ctx: ICtx) => {
      return null
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
