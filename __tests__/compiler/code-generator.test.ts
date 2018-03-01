import { codeGenerator } from '../../src/compiler/code-generator'
import { allTechnologiesInfo, testEvTypeDefs } from './fixtures';
import { getExecutor } from './helpers/test-runner'

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
const executor = getExecutor(testEvTypeDefs)
describe('Code Generator', () => {
  it('should work', async () => {
    // expect(codeGenerator(allTechnologiesInfo)).toEqual('')
    const [value, args, ctx, info] = await executor(query, null)
    const cypher = codeGenerator(args, info)
    console.log(cypher)
    // expect(codeGenerator())
  });
});
