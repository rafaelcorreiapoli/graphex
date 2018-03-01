//  @flow
import * as pluralize from 'pluralize'
import * as _ from 'lodash'
import { lowerFirstLetter } from '../common/string'
import { IGraphexType, IGraphexSchema, IGraphexField, IGraphexNode } from '../graphex-schema/ast-to-graphex-schema'
import { TypeNode } from 'graphql';

const BANG = '!'
export const joinWithLF = (lines: string[]): string => lines.filter((ln) => ln !== null).join('\n')
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

export const attachCrudOperations = (userTypes: string, graphexSchema: IGraphexType[]): string => {
  const mutations: string = joinWithLF(graphexSchema.map((type) =>
    joinWithLF([
      getAddMutation(type),
      getEditMutation(type),
      getDeleteMutation(type),
    ])))
  const queries: string = joinWithLF(graphexSchema.map((type) =>
    joinWithLF([
      `${lowerFirstLetter(type.name)}(_id: ID!): ${type.name}`,
      `all${pluralize(type.name)}: [${type.name}]`,
    ])))

  return joinWithLF([
    `${generateInputs(graphexSchema)}`,
    `${userTypes}`,
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
