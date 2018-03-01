import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLSchema } from 'graphql';
import { ITypeDefinitions, IResolvers} from 'graphql-tools/dist/Interfaces';
import { ISchemaPlugin } from '../interface';
import { joinWithLF, lowerFirstLetter } from '../../common/string';
import { userDefinedTypesToGraphexSchema } from '../../graphex-schema/index'
import { IGraphexSchema, IGraphexType, IGraphexField, IGraphexNode } from '../../graphex-schema/ast-to-graphex-schema'
import * as pluralize from 'pluralize'
import * as _ from 'lodash'

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

const getAddMutation = (type: IGraphexType): string => `add${type.name}(input: ${getAddInputTypeNameForNode(type)}${BANG}): ${type.name} @crud(operation: "create")`
const getEditMutation = (type: IGraphexType): string => `edit${type.name}(input: ${getEditInputTypeNameForNode(type)}${BANG}): ${type.name} @crud(operation: "update")`
const getDeleteMutation = (type: IGraphexType): string => `delete${type.name}(_id: ID!): ${type.name} @crud(operation: "delete")`

export class CrudSchemaPlugin implements ISchemaPlugin {
  private userDefinedTypes: ITypeDefinitions
  private graphexSchema: IGraphexSchema

  constructor(userDefinedTypes: string) {
    this.userDefinedTypes = userDefinedTypes
    this.graphexSchema = userDefinedTypesToGraphexSchema(this.userDefinedTypes)
  }
  private getTypeDefs(): ITypeDefinitions {
    const mutations: string = joinWithLF(this.graphexSchema.map((type) =>
      joinWithLF([
        getAddMutation(type),
        getEditMutation(type),
        getDeleteMutation(type),
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
    return {

    }
  }

  public getSchema(): GraphQLSchema {
    console.log(this.getTypeDefs())
    return makeExecutableSchema({
      typeDefs: this.getTypeDefs(),
      resolvers: this.getResolvers(),
    })
  }
}
