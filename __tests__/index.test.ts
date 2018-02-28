import { writeRelation, selectionToCypher, writeObjectNode, ISelectionNode } from '../src/index'

const mySelection2: ISelectionNode = {
  name: 'technology',
  label: 'Technology',
  args: {
    id: 'f910083b-1310-4b6e-be2f-862b803d1684',
  },
  isScalar: false,
  children: [{
    isScalar: true,
    name: 'id',
  }, {
    name: 'organizations',
    label: 'Organization',
    isScalar: false,
    relationToParent: 'MyRelation',
    children: [{
      name: 'id',
      isScalar: true,
    }],
  }],
}
console.log(selectionToCypher(mySelection2))

const mySelection: ISelectionNode = {
  name: 'product',
  label: 'Product',
  args: {
    id: 'Product1',
  },
  isScalar: false,
  children: [{
    isScalar: true,
    name: 'id',
  }, {
    name: 'order',
    label: 'Order',
    isScalar: false,
    relationToParent: 'ORDER_PRODUCTS',
    children: [{
      label: 'Customer',
      isScalar: false,
      relationToParent: 'CUSTOMER_ORDERS',
      name: 'customer',
      children: [{
        isScalar: true,
        name: 'name',
      }],
    }, {
      isScalar: true,
      name: 'date',
      auth: function authOrderDate() { return true },
    }, {
      isScalar: true,
      name: 'tweet',
      custom: function getOrderTweet() { return 'blablabla' },
    }],
  }],
}

const myCypher = `MATCH (product:Product {id: \"Product1\"}) RETURN product { .id, order: [(product)-[:ORDER_PRODUCTS]-(product_order:Order) | product_order { customer: [(order)-[:CUSTOMER_ORDERS]-(product_order_customer:Customer) | product_order_customer { .name }], .date, .tweet }] }`

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

const myCypher2 = `MATCH (technology:Technology {id: "f910083b-1310-4b6e-be2f-862b803d1684"}) RETURN technology { .id, organizations: [(technology)-[:MyRelation]-(technology_organizations:Organization) | technology_organizations { .id }] }`

describe('Name of the group', () => {
  it('should behave...', () => {
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
