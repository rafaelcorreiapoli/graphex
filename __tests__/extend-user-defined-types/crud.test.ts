import { attachCrudOperations, generateInput } from '../../src/lib/extend-user-defined-types/crud'
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

const expected = `input UserInput {
name: String!
numbers: Float
scopes: String!
posts: PostInput!
}
input PostInput {
text: String
secretNote: String
author: UserInput!
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
addUser(input: UserInput!): User
editUser(_id: ID!, input: UserInput!): User
deleteUser(_id: ID!): User
addPost(input: PostInput!): Post
editPost(_id: ID!, input: PostInput!): Post
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
    const expectedGeneratedInput = 'input TechnologyDescriptionInput {\nname: String\n}'
    expect(generateInput(technologyDescriptionType)).toEqual(expectedGeneratedInput)
  })
})
