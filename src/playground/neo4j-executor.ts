import { IOperationExecutor, IParams } from '../lib/plugins/crud';
import { insertNode, findSingle, findMultiple } from '../lib/neo4j/operations'
import { ICtx } from './resolvers';
import { GraphQLResolveInfo } from 'graphql';
import { generateCypher } from '../lib/cypher/cypher-compiler'

export enum ReturnType {
  ARRAY = 'array',
  OBJECT = 'object',
}

const getInfoReturnType = (info: GraphQLResolveInfo): ReturnType => info.returnType.toString().charAt(0) === '[' ? ReturnType.ARRAY : ReturnType.OBJECT

// const session = ctx.driver.session()
// const result = await session.run(cypherQuery)

// switch (returnType) {
//         case ReturnType.ARRAY:
//           return result.records.map((record) => record.get(variable))
//         case ReturnType.OBJECT:
//           if (result.records.length > 0) {
//             // FIXME: use one of the new neo4j-driver consumers when upgrading neo4j-driver package
//             return result.records[0].get(variable);
//           } else {
//             return null;
//           }
//       }

export class Neo4jOperationExecutor implements IOperationExecutor {
  public async create(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo) {
    const { driver } = ctx
    const session = driver.session()
    return insertNode(session, typeName, params.input)
  }

  public async delete(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo) {
    // const { driver } = ctx.driver
    return 2
  }
  public async update(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo) {
    // const { driver } = ctx.driver
    return 3
  }
  public async retrieveSingle(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo) {
    const variable = info.fieldName
    const cypherQuery = generateCypher(params, info)
    const { driver } = ctx
    const session = driver.session()

    return findSingle(session, cypherQuery, variable)
  }
  public async retrieveMultiple(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo) {
    const variable = info.fieldName
    const cypherQuery = generateCypher(params, info)
    const { driver } = ctx
    const session = driver.session()

    return findMultiple(session, cypherQuery, variable)
  }
}
