export interface IArgsMap {[key: string]: string | number}

export interface INode {
  name: string
  args?: IArgsMap
  auth?: () => boolean
  custom?: () => any
}
export interface IScalarNode extends INode {
  isScalar: true
}
export interface IObjectNode extends INode {
  isScalar: false
  children: ISelectionNode[]
  relationToParent?: string
  label: string
}
export type ISelectionNode = IScalarNode | IObjectNode

const writeArgs = (args: IArgsMap) => {
  if (!args) { return '' }
  return `{${Object.keys(args).map((argName) => {
    const argValue = args[argName]
    return `${argName}: "${argValue}"`
  }).join(', ')}}`
}

export const writeRelation = (relationName: string, arrowLeft: boolean = false, arrowRight: boolean = false) => `${(arrowLeft && !arrowRight) ? '<' : ''}-[:${relationName}]-${(arrowRight && !arrowLeft) ? '>' : ''}`

const ifTruthy = (val: any, char: string) => val ? char : ''

export const writeObjectNode = (alias: string, type?: string, args?: IArgsMap) => `(${ifTruthy(alias, alias)}${ifTruthy(type, `:${type}`)}${ifTruthy(args, ` ${writeArgs(args)}`)})`

export const cypherChildren = (parent: IObjectNode, lastNestedFieldName: string): string => {
  return parent.children.map((child) => {
    const nestedFieldName = `${lastNestedFieldName}_${child.name}`
    if (child.isScalar) {
      const scalarNode = child as IScalarNode
      return `.${scalarNode.name}`
    } else {
      const objectNode = child as IObjectNode
      return [
        `${objectNode.name}: `,
        `[${writeObjectNode(parent.name)}`,
        `${writeRelation(objectNode.relationToParent)}`,
        `${writeObjectNode(nestedFieldName, objectNode.label)} | ${nestedFieldName} { ${cypherChildren(objectNode, nestedFieldName)} }]`,
      ].join('')
    }
  }).join(', ')
}

export const selectionToCypher = (selection: ISelectionNode) => {
  if (!selection.isScalar) {
    const objectNode = selection as IObjectNode
    return `MATCH ${writeObjectNode(objectNode.name, objectNode.label, objectNode.args)} RETURN ${objectNode.name} { ${cypherChildren(objectNode, objectNode.name)} }`
  }
}
