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

export const allTechnologiesInfo: GraphQLResolveInfo = {
  fieldName: 'allTechnologies',
  fieldNodes: [{
    kind: 'Field',
    alias: undefined,
    name: {
        kind: 'Name',
        value: 'allTechnologies',
        loc: { start: 4, end: 19 },
      },
    arguments: [],
    directives: [],
    selectionSet: {
        kind: 'SelectionSet',
        selections: [{
          kind: 'Field',
          alias: undefined,
          name: {
            kind: 'Name',
            value: 'organizations',
            loc: { start: 26, end: 39 },
          },
          arguments: [],
          directives: [],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [{
              kind: 'Field',
              alias: undefined,
              name: {
                kind: 'Name',
                value: 'name',
                loc: { start: 48, end: 52 },
              },
              arguments: [],
              directives: [],
              selectionSet: undefined,
              loc: { start: 48, end: 52 },
            }],
            loc: { start: 40, end: 58 } },
          loc: { start: 26, end: 58 } } ],
        loc: { start: 20, end: 62 } },
    loc: { start: 4, end: 62 },
  }],
  returnType: ['Technology'],
  parentType: 'Query',
  path: { prev: undefined, key: 'allTechnologies' },
}
