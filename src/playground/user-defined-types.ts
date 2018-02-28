export const userDefinedTypes = `
  type Technology {
    id: ID!
    name: String!
    organizations: [Organization]  @relation(name: "MyRelation", direction: "IN")
  }

  type Organization {
    id: ID!
    name: String!
    technologies: [Technology] @relation(name: "MyRelation", direction: "OUT")
  }
`
