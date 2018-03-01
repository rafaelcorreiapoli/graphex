import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLSchema, parse, DocumentNode, ObjectTypeDefinitionNode, GraphQLResolveInfo } from 'graphql'
import { ITypeDefinitions, IResolvers, IFieldResolver} from 'graphql-tools/dist/Interfaces';
import { ISchemaPlugin } from '../interface';
import { joinWithLF, lowerFirstLetter } from '../../common/string';
import { userDefinedTypesToGraphexSchema } from '../../graphex-schema/index'
import { IGraphexSchema, IGraphexType, IGraphexField, IGraphexNode } from '../../graphex-schema/ast-to-graphex-schema'
import * as pluralize from 'pluralize'
import * as _ from 'lodash'
import { directivesToJson } from '../../common/ast-helpers'
import { Driver } from 'neo4j-driver/types/v1';
import { insertNode } from '../../neo4j/operations';

type DriverGetter = (ctx: any) => Driver

const BANG = '!'
const getAddInputTypeNameForNode = (node: IGraphexNode): string => `Add${node.type}Input`
const getEditInputTypeNameForNode = (node: IGraphexNode): string => `Edit${node.type}Input`

const isScalar = (field: IGraphexField): boolean => _.includes(['String', 'Int', 'Float', 'Boolean', 'JSON', 'Date', 'DateTime', 'Time'], field.type)
const generateFieldInput = (field: IGraphexField): string => {
  return isScalar(field) ? `${field.name}: ${field.type}${field.attributes.required ? BANG : ''}` : null
}

export const generateInput = (type: IGraphexType): string => joinWithLF([
  `input ${getAddInputTypeNameForNode(type)} {`,
    joinWithLF(type.fields.filter((field) => field.type !== 'ID').map(generateFieldInput)),
  '}',
  `input ${getEditInputTypeNameForNode(type)} {`,
    '_id: ID!',
    joinWithLF(type.fields.filter((field) => field.type !== 'ID').map(generateFieldInput)),
  '}',
])

const generateInputs = (graphexSchema: IGraphexType[]): string => joinWithLF(graphexSchema.map(generateInput))

const getCreateFieldName = (name: string) => `add${name}`
const getUpdateFieldName = (name: string) => `edit${name}`
const getDeleteFieldName = (name: string) => `delete${name}`
const getRetrieveSingleFieldName = (name: string) => `${lowerFirstLetter(name)}`
const getRetrieveAllFieldName = (name: string) => `all${name}`

const getCreateMutationField = (type: IGraphexType): string => `${getCreateFieldName(type.name)}(input: ${getAddInputTypeNameForNode(type)}${BANG}): ${type.name}`
const getUpdateMutationField = (type: IGraphexType): string => `${getUpdateFieldName(type.name)}(input: ${getEditInputTypeNameForNode(type)}${BANG}): ${type.name}`
const getDeleteMutationField = (type: IGraphexType): string => `${getDeleteFieldName(type.name)}(_id: ID!): ${type.name}`
const getRetrieveSingleField = (type: IGraphexType): string => `${getRetrieveSingleFieldName(type.name)}(_id: ID!): ${type.name}`
const getRetrieveAllField = (type: IGraphexType): string => `${getRetrieveAllFieldName(type.name)}: [${type.name}]`

interface IDirectives {
  crud: {
    use?: string[],
  }
}

export interface IParams {
  [argument: string]: any;
}
export interface IOperationExecutor {
  create(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo): Promise<any>
  delete(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo): Promise<any>
  update(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo): Promise<any>
  retrieveSingle(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo): Promise<any>
  retrieveMultiple(typeName: string, value: any, params: IParams, ctx: any, info: GraphQLResolveInfo): Promise<any>
}

const delegateCreateToExecutor = (field: ObjectTypeDefinitionNode, operationExecutor: IOperationExecutor): IFieldResolver<any, any> => (value, params, ctx, info) => {
  return operationExecutor.create(field.name.value, value, params, ctx, info)
}
const delegateUpdateToExecutor = (field: ObjectTypeDefinitionNode, operationExecutor: IOperationExecutor): IFieldResolver<any, any> => (value, params, ctx, info) => {
  return operationExecutor.update(field.name.value, value, params, ctx, info)
}
const delegateDeleteToExecutor = (field: ObjectTypeDefinitionNode, operationExecutor: IOperationExecutor): IFieldResolver<any, any> => (value, params, ctx, info) => {
  return operationExecutor.delete(field.name.value, value, params, ctx, info)
}
const delegateRetrieveSingleToExecutor = (field: ObjectTypeDefinitionNode, operationExecutor: IOperationExecutor): IFieldResolver<any, any> => (value, params, ctx, info) => {
  return operationExecutor.retrieveSingle(field.name.value, value, params, ctx, info)
}
const delegateRetrieveMultipleToExecutor = (field: ObjectTypeDefinitionNode, operationExecutor: IOperationExecutor): IFieldResolver<any, any> => (value, params, ctx, info) => {
  return operationExecutor.retrieveMultiple(field.name.value, value, params, ctx, info)
}

export class CrudSchemaPlugin implements ISchemaPlugin {
  private userDefinedTypes: ITypeDefinitions
  private graphexSchema: IGraphexSchema
  private documentNode: DocumentNode
  private operationExecutor: IOperationExecutor

  constructor(userDefinedTypes: string, operationExecutor: IOperationExecutor) {
    this.userDefinedTypes = userDefinedTypes
    this.graphexSchema = userDefinedTypesToGraphexSchema(this.userDefinedTypes)
    this.documentNode = parse(this.userDefinedTypes)
    this.operationExecutor = operationExecutor
  }
  private getTypeDefs(): ITypeDefinitions {
    const mutations: string = joinWithLF(this.graphexSchema.map((type) =>
      joinWithLF([
        getCreateMutationField(type),
        getUpdateMutationField(type),
        getDeleteMutationField(type),
      ]),
    ))

    const queries: string = joinWithLF(this.graphexSchema.map((type) =>
      joinWithLF([
        getRetrieveSingleField(type),
        getRetrieveAllField(type),
      ])))

    return joinWithLF([
      `${generateInputs(this.graphexSchema)}`,
      `${this.userDefinedTypes}`,
      'type Query {',
        `${queries}`,
      '}',
      'type Mutation {',
        `${mutations}`,
      '}',
      'schema {',
        'query: Query',
        'mutation: Mutation',
      '}',
    ])
  }

  private getResolvers(): IResolvers {
    const definitions = this.documentNode.definitions

    const typesWithCrudDirective = definitions.filter((definition) => {
      if (definition.kind === 'ObjectTypeDefinition') {
        const directives = directivesToJson(definition.directives) as IDirectives
        return directives.crud
      }
      return false
    }) as ObjectTypeDefinitionNode[]

    const mutationResolvers = typesWithCrudDirective.reduce((acc, type) => {
      return {
        ...acc,
        [getCreateFieldName(type.name.value)]: delegateCreateToExecutor(type, this.operationExecutor),
        [getUpdateFieldName(type.name.value)]: delegateUpdateToExecutor(type, this.operationExecutor),
        [getDeleteFieldName(type.name.value)]: delegateDeleteToExecutor(type, this.operationExecutor),
      }
    }, {})

    const queryResolvers = typesWithCrudDirective.reduce((acc, type) => {
      return {
        ...acc,
        [getRetrieveSingleFieldName(type.name.value)]: delegateRetrieveSingleToExecutor(type, this.operationExecutor),
        [getRetrieveAllFieldName(type.name.value)]: delegateRetrieveMultipleToExecutor(type, this.operationExecutor),
      }
    }, {})

    return {
      Mutation: mutationResolvers,
      Query: queryResolvers,
    }
  }

  public getSchema(): GraphQLSchema {
    return makeExecutableSchema({
      typeDefs: this.getTypeDefs(),
      resolvers: this.getResolvers(),
    })
  }
}
