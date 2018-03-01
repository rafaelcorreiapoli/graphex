import { userDefinedTypesToGraphexSchema } from '../index';
import { schemaDefinition, expected } from './fixtures';

describe('getThunderSchema', () => {
  it('can convert a schemaDefinition to a thunderSchema', () => {
    expect(userDefinedTypesToGraphexSchema(schemaDefinition)).toEqual(expected)
  })
})
