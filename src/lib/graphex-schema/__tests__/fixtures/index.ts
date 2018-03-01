export const schemaDefinition = `
type User @storage(db: "mysql", collection: "Users") @auth(scope: ["admin", "manager"], fn: "isOwner"){
  _id: ID!
  name: String!
  numbers: [Float]
  scopes: [String!]!
  posts: [Post]! @relation(name: "UserPosts")
}


type Post @storage(db: "mongo", collection: "posts"){
  _id: ID!
  text: String
  secretNote: String @auth(scope: "admin")
  author: User! @relation(name: "UserPosts")
}
`

const defaults = {
  isArray: false,
  itemRequired: false,
  required: false,
}

export const expected = [{
  name: 'User',
  type: 'User',
  directives: {
    storage: {
      db: 'mysql',
      collection: 'Users',
    },
    auth: {
      scope: ['admin', 'manager'],
      fn: 'isOwner',
    },
  },
  fields: [{
    name: '_id',
    type: 'ID',
    attributes: {
      ...defaults,
      required: true,
      isArray: false,
    },
    directives: {},
  }, {
    name: 'name',
    type: 'String',
    attributes: {
      ...defaults,
      required: true,
      isArray: false,
    },
    directives: {},
  }, {
    name: 'numbers',
    type: 'Float',
    attributes: {
      ...defaults,
      required: false,
      isArray: true,
    },
    directives: {},
  }, {
    name: 'scopes',
    type: 'String',
    attributes: {
      ...defaults,
      isArray: true,
      itemRequired: true,
      required: true,
    },
    directives: {},
  }, {
    name: 'posts',
    type: 'Post',
    attributes: {
      ...defaults,
      isArray: true,
      required: true,
      itemRequired: false,
    },
    directives: {
      relation: {
        name: 'UserPosts',
      },
    },
  }],
}, {
  name: 'Post',
  type: 'Post',
  directives: {
    storage: {
      db: 'mongo',
      collection: 'posts',
    },
  },
  fields: [{
    name: '_id',
    type: 'ID',
    attributes: {
      ...defaults,
      required: true,
      isArray: false,
    },
    directives: {},
  }, {
    name: 'text',
    type: 'String',
    attributes: {
      ...defaults,
      required: false,
    },
    directives: {},
  },  {
    name: 'secretNote',
    type: 'String',
    attributes: {
      ...defaults,
    },
    directives: {
      auth: {
        scope: 'admin',
      },
    },
  }, {
    name: 'author',
    type: 'User',
    attributes: {
      ...defaults,
      required: true,
    },
    directives: {
      relation: {
        name: 'UserPosts',
      },
    },
  }],
}]
