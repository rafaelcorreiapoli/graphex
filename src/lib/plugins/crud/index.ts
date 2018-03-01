import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLSchema, parse, DocumentNode, ObjectTypeDefinitionNode } from 'graphql'
import { ITypeDefinitions, IResolvers} from 'graphql-tools/dist/Interfaces';
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

const getCreateMutationField = (type: IGraphexType): string => `${getCreateFieldName(type.name)}(input: ${getAddInputTypeNameForNode(type)}${BANG}): ${type.name}`
const getUpdateMutationField = (type: IGraphexType): string => `${getUpdateFieldName(type.name)}(input: ${getEditInputTypeNameForNode(type)}${BANG}): ${type.name}`
const getDeleteMutationField = (type: IGraphexType): string => `${getDeleteFieldName(type.name)}(_id: ID!): ${type.name}`

const getCreateMutationResolver = (field: ObjectTypeDefinitionNode, driverGetter: DriverGetter) => {
  return (value, params, ctx, info) => {
    const driver = driverGetter(ctx)
    const session = driver.session()
    return insertNode(session, field.name.value, params)
  }
}

interface IDirectives {
  crud: {
    use?: string[],
  }
}

export interface IOperationExecutor {
  create(typeName: string, params: any, ctx: any): Promise<any>
  delete(typeName: string, params: any, ctx: any): Promise<any>
  update(typeName: string, params: any, ctx: any): Promise<any>
}

const delegateCreateToExecutor = (field: ObjectTypeDefinitionNode, operationExecutor: IOperationExecutor) => (value, params, ctx, info) => {
  return operationExecutor.create(field.name.value, params, ctx)
}
const delegateUpdateToExecutor = (field: ObjectTypeDefinitionNode, operationExecutor: IOperationExecutor) => (value, params, ctx, info) => {
  return operationExecutor.update(field.name.value, params, ctx)
}
const delegateDeleteToExecutor = (field: ObjectTypeDefinitionNode, operationExecutor: IOperationExecutor) => (value, params, ctx, info) => {
  return operationExecutor.delete(field.name.value, params, ctx)
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
        `${lowerFirstLetter(type.name)}(_id: ID!): ${type.name}`,
        `all${pluralize(type.name)}: [${type.name}]`,
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

    const resolvers = typesWithCrudDirective.reduce((acc, type) => {
      return {
        ...acc,
        [getCreateFieldName(type.name.value)]: delegateCreateToExecutor(type, this.operationExecutor),
        [getUpdateFieldName(type.name.value)]: delegateUpdateToExecutor(type, this.operationExecutor),
        [getDeleteFieldName(type.name.value)]: delegateDeleteToExecutor(type, this.operationExecutor),
      }
    }, {})

    return {
      Mutation: resolvers,
    }
  }

  public getSchema(): GraphQLSchema {
    return makeExecutableSchema({
      typeDefs: this.getTypeDefs(),
      resolvers: this.getResolvers(),
    })
  }
}
