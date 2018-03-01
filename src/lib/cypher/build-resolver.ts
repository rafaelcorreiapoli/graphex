import { DocumentNode, ObjectTypeDefinitionNode, FieldDefinitionNode } from 'graphql'
import { log } from '../common/string'
import { Driver } from 'neo4j-driver/types/v1'
import { insertNode } from '../neo4j/operations';
import { argumentsToJson, directivesToJson } from './cypher-compiler'

type DriverGetter = (ctx: any) => Driver

export enum CrudOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

const getResolverForField = (field: FieldDefinitionNode) => {
  return (value, params, ctx, info) => {
    const driver = driverGetter(ctx)
    const session = driver.session()
    return insertNode(session, 'Technology', params)
  }
}

const getResolverForCrudOperation = (operation: CrudOperation) => {
  switch (operation) {
    case CrudOperation.CREATE:
    case CrudOperation.UPDATE:
    case CrudOperation.DELETE:
  }
}

export interface ICustomResolversMap {
  [key: string]: any
}

export const buildResolvers = (graphQLAst: DocumentNode, driverGetter: DriverGetter, customResolver: CustomResolversMap) => {
  const definitions = graphQLAst.definitions
  const objectDefinitions = definitions.filter((definition) => definition.kind === 'ObjectTypeDefinition') as ObjectTypeDefinitionNode[]
  const mutationDefinition = objectDefinitions.find((definition: ObjectTypeDefinitionNode) => definition.name.value === 'Mutation') as ObjectTypeDefinitionNode
  // console.log(mutationDefinition)

  // const getAddNodeResolverForField = (field: Field)

  const mutationResolvers = mutationDefinition.fields.slice(0, 1).reduce((acc, field) => {
    const directives = directivesToJson(field.directives)
    console.log(directives)
    // return {
    //   ...acc,
    //   [field.name.value]: getResolverForField(field),
    // }
  }, {})

  // console.log(mutationResolvers)
  return {
    Query: {

    },
    Mutation: {

    },
  }
}
