import { getFieldWithDefaultAttributes } from './helpers'
import { DocumentNode, DefinitionNode, ObjectTypeDefinitionNode, FieldDefinitionNode, TypeNode, NamedTypeNode, DirectiveNode, ValueNode, ListValueNode, BooleanValueNode, StringValueNode, IntValueNode, FloatValueNode } from 'graphql';

export interface IGraphexDirectives {
  relation?: {
    name: string,
  },
  auth?: {
    fn: string,
  },
  custom?: {
    fn: string,
  },
}
export interface IGraphexNode {
  name: string
  type: string
  directives: IGraphexDirectives
}
export interface IGraphexType extends IGraphexNode {
  fields: IGraphexField[]
}

export type IGraphexSchema = IGraphexType[]

export interface IGraphexField extends IGraphexNode {
  attributes: IGraphexFieldAttributes
}

export interface IGraphexFieldAttributes {
  isArray: boolean,
  itemRequired: boolean,
  required: boolean,
}

const isMutationOrQuery = (objectType: ObjectTypeDefinitionNode) => ['Mutation', 'Query'].indexOf(objectType.name.value) !== -1

const extractNodeTypeName = (typeNode: TypeNode): string => {
  if (typeNode.kind === 'NamedType') {
    const namedTypeNode = typeNode as NamedTypeNode
    return namedTypeNode.name.value
  }
  if (typeNode.type) {
    return extractNodeTypeName(typeNode.type)
  }
  return null
}
const extractNodeAttribute = (typeNode: TypeNode, parent: TypeNode) => {
  const kind = typeNode.kind
  const parentKind = parent && parent.kind
  if (kind === 'NonNullType' && parentKind === null) {
    return { required: true }
  }
  if (kind === 'NonNullType' && parentKind === 'ListType') {
    return { itemRequired: true }
  }
  if (kind === 'ListType') {
    return { isArray: true }
  }
  return {}
}

const defaults = {
  isArray: false,
  itemRequired: false,
  required: false,
}

const extractNodeAttributesRecur = (type: TypeNode, parentType: TypeNode, attributes: any = {}): IGraphexFieldAttributes => {
  const extractedAttributes = extractNodeAttribute(type, parentType)
  const newAttributes = {
    ...defaults,
    ...attributes,
    ...extractedAttributes,
  }
  if (type.kind !== 'NamedType') {
    return extractNodeAttributesRecur(type.type, type, newAttributes)
  }
  return newAttributes
}

// REFACTOR
const parseArgumentValues = (valueNode: ValueNode): any => {
  if (valueNode.kind === 'ListValue') {
    const listValueNode = valueNode as ListValueNode
    return listValueNode.values.map(parseArgumentValues)
  }
  const interestingValueNode = valueNode as BooleanValueNode | StringValueNode | IntValueNode | FloatValueNode
  return interestingValueNode.value
}

const mapDirectives = (directives: DirectiveNode[]): IGraphexDirectives => directives.reduce((accDirectives, directive) => ({
  ...accDirectives,
  [directive.name.value]: directive.arguments.reduce((accArguments, argument) => ({
    ...accArguments,
    [argument.name.value]: parseArgumentValues(argument.value),
  }), {}),
}), {}) as IGraphexDirectives

const writeField = (field: FieldDefinitionNode): IGraphexField => {
  const type = extractNodeTypeName(field.type)
  const attributes = extractNodeAttributesRecur(field.type, null)
  return {
    name: field.name.value,
    type,
    directives: mapDirectives(field.directives),
    attributes,
  }
}

const writeFields = (fields: FieldDefinitionNode[]): IGraphexField[] => fields.map(writeField)

const writeGraphexType = (objectType: ObjectTypeDefinitionNode): IGraphexType => {
  return {
    name: objectType.name.value,
    type: objectType.name.value,
    fields: writeFields(objectType.fields),
    directives: mapDirectives(objectType.directives),
  }
}

const writeGraphexTypes = (objectTypes: ObjectTypeDefinitionNode[]) => objectTypes.reduce((acc, objectType) => {
  if (isMutationOrQuery(objectType)) {
    return acc
  }
  return [
    ...acc,
    writeGraphexType(objectType),
  ]
}, [])

const parseDefinitions = (definitions: DefinitionNode[]) => {
  const objectTypes = definitions.filter((definition) => definition.kind === 'ObjectTypeDefinition') as ObjectTypeDefinitionNode[]
  return writeGraphexTypes(objectTypes)
}

const parseDocument = (doc: DocumentNode) => parseDefinitions(doc.definitions)

export const astToGraphexSchema = (graphQLAst: DocumentNode) => parseDocument(graphQLAst)
