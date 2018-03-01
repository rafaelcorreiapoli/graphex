import { GraphQLResolveInfo, GraphQLOutputType, SelectionNode, GraphQLNamedType, GraphQLScalarType, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLEnumType, GraphQLInterfaceType, GraphQLUnionType, DirectiveNode, ArgumentNode, ValueNode, StringValueNode } from 'graphql'
import { joinWithLF } from '../lib/extend-user-defined-types/crud'
import * as _ from 'lodash'
import { log } from '../lib/common/string';
import { IGraphexDirectives } from '../lib/graphex-schema/ast-to-graphex-schema'

const writeArgsString = (args: any) => args && JSON.stringify(args).replace(/\"([^(\")"]+)\":/g, '$1:')

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

const ifTruthy = (val: any, char: string) => val ? char : ''

export const writeObjectNode = (alias: string, type?: string, args?: any) => `(${ifTruthy(alias, alias)}${ifTruthy(type, `:${type}`)}${ifTruthy(args, ` ${writeArgsString(args)}`)})`
export const writeRelation = (relationName: string, arrowLeft: boolean = false, arrowRight: boolean = false) => `${(arrowLeft && !arrowRight) ? '<' : ''}-[:${relationName}]-${(arrowRight && !arrowLeft) ? '>' : ''}`

export const myCypher = `MATCH (product:Product {id: \"Product1\"}) RETURN product { .id, order: [(product)-[:ORDER_PRODUCTS]-(product_order:Order) | product_order { customer: [(order)-[:CUSTOMER_ORDERS]-(product_order_customer:Customer) | product_order_customer { .name }], .date, .tweet }] }`
export const myCypher2 = `MATCH (technology:Technology {id: "f910083b-1310-4b6e-be2f-862b803d1684"}) RETURN technology { .id, organizations: [(technology)-[:MyRelation]-(technology_organizations:Organization) | technology_organizations { .id }] }`

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

const argumentsToJson = (args: ArgumentNode[]) => args.reduce((acc, arg) => ({
  ...acc,
  [arg.name.value]: getValueFromArg(arg.value),
}), {})

const directivesToJson = (directives: DirectiveNode[]): IGraphexDirectives => directives.reduce((acc, directive) => ({
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
          return `${fieldName}: [${writeObjectNode(variable)}${writeRelation(directives.relation.name)}${writeObjectNode(nestedFieldName, inner.name)} | ${nestedFieldName} { ${buildCypherSelection(selectionSelections, schemaType, nestedFieldName)} }]`
        }
      }
    }
  }).join(', ')

}

export const codeGenerator = (args: any, info: GraphQLResolveInfo) => {
  const variable = info.fieldName
  const type = info.returnType.toString()
  const argString = writeArgsString(args)
  const selections =  info.fieldNodes[0].selectionSet.selections;
  const schemaType = info.schema.getType(type);
  return joinWithLF([
    `MATCH (${variable}:${type} ${argString})`,
    `RETURN ${variable} { ${buildCypherSelection(selections, schemaType, variable)} } AS ${variable}`,
  ])
}
