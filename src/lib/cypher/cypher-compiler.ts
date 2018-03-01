import { GraphQLResolveInfo, GraphQLOutputType, SelectionNode, GraphQLNamedType, GraphQLScalarType, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLEnumType, GraphQLInterfaceType, GraphQLUnionType, DirectiveNode, ArgumentNode, ValueNode, StringValueNode } from 'graphql'
import * as _ from 'lodash'
import { IGraphexDirectives } from '../graphex-schema/ast-to-graphex-schema';
import { writeObjectNode, writeRelation, writeArgsString } from './code-generation'

const innerType = (type: GraphQLOutputType): GraphQLScalarType | GraphQLObjectType => {
  if (type instanceof GraphQLInterfaceType || type instanceof GraphQLUnionType || type instanceof GraphQLEnumType || type instanceof GraphQLInterfaceType) {
    console.log('Not supported!')
    return null
  }
  if (type instanceof GraphQLNonNull || type instanceof GraphQLList) {
    return innerType(type.ofType)
  }
  return type
}

// TODO: Handler other kinds of values
export const getValueFromArg = (argValue: ValueNode): any => {
  if (argValue.kind === 'StringValue' || argValue.kind === 'IntValue' || argValue.kind === 'FloatValue') {
    return argValue.value
  }
  if (argValue.kind === 'ListValue') {
    return argValue.values.map(getValueFromArg)
  }

  if (argValue.kind === 'ObjectValue') {
    const fields = argValue.fields.map((x) => x)
    return fields.reduce((acc, field) => {
      return {
        ...acc,
        [field.name.value]: getValueFromArg(field.value),
      }
    }, {})
  }
  return null
}

export const argumentsToJson = (args: ArgumentNode[]) => args.reduce((acc, arg) => ({
  ...acc,
  [arg.name.value]: getValueFromArg(arg.value),
}), {})

export const directivesToJson = (directives: DirectiveNode[]): IGraphexDirectives => directives.reduce((acc, directive) => ({
  ...acc,
  [directive.name.value]: argumentsToJson(directive.arguments),
}), {}) as IGraphexDirectives

const buildCypherSelection = (selections: SelectionNode[], schemaType: GraphQLNamedType, variable: string): string => {
  return selections.map((selection) => {
    if (selection.kind === 'Field') {
      const fieldName = selection.name.value
      if (schemaType instanceof GraphQLObjectType) {

        const schemaFields = schemaType.getFields()
        const field = schemaFields[fieldName]
        const inner = innerType(field.type)
        if (inner instanceof GraphQLScalarType) {
          return `.${fieldName}`
        } else if (inner instanceof GraphQLObjectType) {
          const nestedFieldName = `${variable}_${fieldName}`
          const selectionSelections = selection.selectionSet.selections
          const directives = directivesToJson(field.astNode.directives)
          const { relation } = directives
          return `${fieldName}: [${writeObjectNode(variable)}${writeRelation(directives.relation.name)}${writeObjectNode(nestedFieldName, inner.name)} | ${nestedFieldName} { ${buildCypherSelection(selectionSelections, inner, nestedFieldName)} }]`
        }
      }
    }
  }).join(', ')

}

export const codeGenerator = (params: any, info: GraphQLResolveInfo) => {
  const variable = info.fieldName
  const type = info.returnType.toString()
  const argString = writeArgsString(params)
  const selections =  info.fieldNodes[0].selectionSet.selections;
  const schemaType = info.schema.getType(type);
  return [
    `MATCH (${variable}:${type} ${argString})`,
    `RETURN ${variable} { ${buildCypherSelection(selections, schemaType, variable)} }`,
  ].join(' ')
}
