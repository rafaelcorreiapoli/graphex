import { ISelectionNode } from '../src';

export const mySelection2: ISelectionNode = {
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

export const mySelection: ISelectionNode = {
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

export const myCypher = `MATCH (product:Product {id: \"Product1\"}) RETURN product { .id, order: [(product)-[:ORDER_PRODUCTS]-(product_order:Order) | product_order { customer: [(order)-[:CUSTOMER_ORDERS]-(product_order_customer:Customer) | product_order_customer { .name }], .date, .tweet }] }`
export const myCypher2 = `MATCH (technology:Technology {id: "f910083b-1310-4b6e-be2f-862b803d1684"}) RETURN technology { .id, organizations: [(technology)-[:MyRelation]-(technology_organizations:Organization) | technology_organizations { .id }] }`