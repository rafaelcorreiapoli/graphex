import { codeGenerator } from '../cypher-compiler';
import { getExecutor } from './helpers/test-runner';
import { testEvTypeDefs } from './fixtures';

const query = `
{
  technology(id: "123") {
    name
    id
    organizations {
      id
    }
  }
}
`
const resolversGetter = (resolve) => ({
  Query: {
    allTechnologies: resolve,
    technology: resolve,
  },
})
const executor = getExecutor(testEvTypeDefs, resolversGetter)

describe('Code Generator', () => {
  it('should work', async () => {
    const { params, info } =  await executor(query, null)
    const cypher = codeGenerator(params, info)
    expect(cypher).toEqual('MATCH (technology:Technology {id:"123"}) RETURN technology { .name, .id, organizations: [(technology)-[:TECHNOLOGIES_ORGANIZATIONS]-(technology_organizations:Organization) | technology_organizations { .id }] } AS technology')
  })
})
