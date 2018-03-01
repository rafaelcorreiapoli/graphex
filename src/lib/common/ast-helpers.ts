import { DirectiveNode, ArgumentNode, ValueNode } from 'graphql';

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

export const directivesToJson = (directives: DirectiveNode[]) => directives.reduce((acc, directive) => ({
  ...acc,
  [directive.name.value]: argumentsToJson(directive.arguments),
}), {})
