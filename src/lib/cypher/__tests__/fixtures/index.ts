import { GraphQLResolveInfo } from 'graphql';

export const testEvTypeDefs = `
type Technology {
  id: ID!
  name: String!
  organizations: [Organization] @relation(name: "TECHNOLOGIES_ORGANIZATIONS") @auth(fn: "authTechOrg") @teste(x: [1,2,3]) @abc(y: {a: 12})
}
type Organization {
  id: ID!
  name: String!
  technologies: [Technology] @relation(name: "TECHNOLOGIES_ORGANIZATIONS")
}

type Query {
  allTechnologies: [Technology]
  technology(id: ID!): Technology
  allOrganizations: [Organization]
  organizations: Organization
}
`;