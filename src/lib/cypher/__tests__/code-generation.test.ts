import { writeRelation, writeObjectNode } from '../code-generation'

describe('writeRelation', () => {
  it('should work for no arrows', () => {
    expect(writeRelation('CUSTOMER_ORDERS', false, false)).toEqual('-[:CUSTOMER_ORDERS]-')
  });
  it('should work for both arrows', () => {
    expect(writeRelation('CUSTOMER_ORDERS', true, true)).toEqual('-[:CUSTOMER_ORDERS]-')
  });
  it('should work for left arrows', () => {
    expect(writeRelation('CUSTOMER_ORDERS', true, false)).toEqual('<-[:CUSTOMER_ORDERS]-')
  });
  it('should work for right arrows', () => {
    expect(writeRelation('CUSTOMER_ORDERS', false, true)).toEqual('-[:CUSTOMER_ORDERS]->')
  });
});
const ifTruthy = (val: any, char: string) => val ? char : ''

describe('writeObjectNode', () => {
  it('should work for args', () => {
    const args = {
      id: 'Product1',
    }
    expect(writeObjectNode('product', 'Product', args)).toEqual('(product:Product {id:"Product1"})')
  });

  it('should work for no args', () => {
    expect(writeObjectNode('product', 'Product')).toEqual('(product:Product)')
  });
})
