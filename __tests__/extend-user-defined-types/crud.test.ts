import { attachCrudOperations, generateInput, joinWithLF } from '../../src/lib/extend-user-defined-types/crud'
import { graphexSchema } from './fixtures'
const userTypes = `type User @auth(fn: "isOwner"){
  _id: ID!
  name: String!
  numbers: [Float]
  scopes: [String!]!
  posts: [Post!]! @relation(name: "UserPosts")
}
type Post {
  _id: ID!
  text: String
  secretNote: String @auth(fn: "admin")
  author: User! @relation(name: "UserPosts")
}`

const expected = `input AddUserInput {
name: String!
numbers: Float
scopes: String!
}
input EditUserInput {
_id: ID!
name: String!
numbers: Float
scopes: String!
}
input AddPostInput {
text: String
secretNote: String
}
input EditPostInput {
_id: ID!
text: String
secretNote: String
}
type User @auth(fn: "isOwner"){
  _id: ID!
  name: String!
  numbers: [Float]
  scopes: [String!]!
  posts: [Post!]! @relation(name: "UserPosts")
}
type Post {
  _id: ID!
  text: String
  secretNote: String @auth(fn: "admin")
  author: User! @relation(name: "UserPosts")
}
type Query {
user: User
allUsers: [User]
post: Post
allPosts: [Post]
}
type Mutation {
addUser(input: AddUserInput!): User
editUser(_id: ID!, input: EditUserInput!): User
deleteUser(_id: ID!): User
addPost(input: AddPostInput!): Post
editPost(_id: ID!, input: EditPostInput!): Post
deletePost(_id: ID!): Post
}
schema {
query: Query
mutation: Mutation
}`

describe('getGqlTypes', () => {
  it('can generate graphql types from a initial schema definition and a thunder graph', () => {
    expect(attachCrudOperations(userTypes, graphexSchema)).toEqual(expected)
  })
})

const defaults = {
  isArray: false,
  itemRequired: false,
  required: false,
}

describe('generateInput', () => {
  it('works', () => {
    const technologyDescriptionType = {
      name: 'TechnologyDescription',
      type: 'TechnologyDescription',
      directives: {},
      fields: [{
        name: '_id',
        type: 'ID',
        attributes: {
          ...defaults,
          required: true,
        },
        directives: {},
      }, {
        name: 'name',
        type: 'String',
        attributes: {
          ...defaults,
          required: false,
        },
        directives: {},
      }],
    }
    const expectedGeneratedInput = joinWithLF([
      'input AddTechnologyDescriptionInput {',
      'name: String',
      '}',
      'input EditTechnologyDescriptionInput {',
      '_id: ID!',
      'name: String',
      '}',
    ])
    expect(generateInput(technologyDescriptionType)).toEqual(expectedGeneratedInput)
  })
})
