const ifTruthy = (val: any, char: string) => val ? char : ''
export const writeObjectNode = (alias: string, type?: string, args?: any) => `(${ifTruthy(alias, alias)}${ifTruthy(type, `:${type}`)}${ifTruthy(args, ` ${writeArgsString(args)}`)})`
export const writeRelation = (relationName: string, arrowLeft: boolean = false, arrowRight: boolean = false) => `${(arrowLeft && !arrowRight) ? '<' : ''}-[:${relationName}]-${(arrowRight && !arrowLeft) ? '>' : ''}`
export const writeArgsString = (args: any) => args && JSON.stringify(args).replace(/\"([^(\")"]+)\":/g, '$1:')
