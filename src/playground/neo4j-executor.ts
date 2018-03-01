import { IOperationExecutor } from '../lib/plugins/crud';
import { insertNode } from '../lib/neo4j/operations';

export class Neo4jOperationExecutor implements IOperationExecutor {
  public async create(typeName: string, params: any, ctx: ICtx) {
    const { driver } = ctx
    const session = driver.session()
    return insertNode(session, typeName, params.input)
  }
  public async delete(typeName: string, params: any, ctx: ICtx) {
    // const { driver } = ctx.driver
    return 2
  }
  public async update(typeName: string, params: any, ctx: ICtx) {
    // const { driver } = ctx.driver
    return 3
  }
}
