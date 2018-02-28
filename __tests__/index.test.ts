import { writeRelation, selectionToCypher, writeObjectNode, ISelectionNode } from '../src/index'
import { mySelection, mySelection2, myCypher, myCypher2 } from './fixtures'

export interface IReturnedField {
  alias: string
  name: string
}

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
    const node = {
      isScalar: false as false,
      name: 'product',
      label: 'Product',
      args: {
        id: 'Product1',
      },
      children: [],
    }
    expect(writeObjectNode(node.name, node.label, node.args)).toEqual('(product:Product {id: "Product1"})')
  });

  it('should work for no args', () => {
    const node = {
      isScalar: false as false,
      name: 'product',
      label: 'Product',
      children: [],
    }
    expect(writeObjectNode(node.name, node.label)).toEqual('(product:Product)')
  });
})

describe('Name of the group', () => {
  it('should work for mySelection...', () => {
    expect(selectionToCypher(mySelection)).toBe(myCypher)
  });
  it('should work for mySelection2', () => {
    expect(selectionToCypher(mySelection2)).toBe(myCypher2)
  })
});

/*
product(id: "Product1") {
  id
  order { //  @relation(name: ORDER_PRODUCTS)
    id
    date // @auth(fn: authOrderDate)
    tweet: // @custom(fn: getOrderTweet)
    customer { //@relation(name: CUSTOMER_ORDERS) @auth(fn: authOrderCustomer)
      id
      name
    }
  }
}

MATCH(product:Product {id: "Product1"})
RETURN product {
  .id
  .order: [(product)-[:ORDER_PRODUCTS]-(product_order:Order) | product_order {
    .id
    .date
    .customer: [(product)-[:CUSTOMER_ORDERS]-(product_order_customer:Customer) | product_order_customer {
      .id
      .name
    }]
  }]
}
*/
