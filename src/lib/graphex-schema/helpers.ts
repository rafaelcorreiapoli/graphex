export const getFieldWithDefaultAttributes = (attributes: any) => ({
  isArray: false,
  required: false,
  itemRequired: false,
  unique: false,
  relationName: null,
  directives: {},
  ...attributes,
})
