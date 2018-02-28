import { userDefinedTypesToAst } from './parse-user-defined-types'
import { astToGraphexSchema } from './ast-to-graphex-schema'

export const userDefinedTypesToGraphexSchema = (userDefinedTypes: string) => astToGraphexSchema(userDefinedTypesToAst(userDefinedTypes))
