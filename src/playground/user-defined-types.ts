export const userDefinedTypes = `
  type Technology @crud(use: ["create", "delete"]) {
    _id: ID!
    name: String!
    projects: [Project]  @relation(name: "TECHNOLOGIES_PROJECTS")
    organizations: [Organization]  @relation(name: "TECHNOLOGIES_ORGANIZATIONS")
    attachments: [Attachment]  @relation(name: "TECHNOLOGIES_ATTACHMENTS")
    tags: [Tag]  @relation(name: "TECHNOLOGIES_TAGS")
  }

  type Project{
    _id: ID!
    name: String!
    technologies: [Technology]  @relation(name: "TECHNOLOGIES_PROJECTS")
    organizations: [Organization]  @relation(name: "PROJECTS_ORGANIZATIONS")
    attachments: [Attachment]  @relation(name: "PROJECTS_ATTACHMENTS")
    tags: [Tag]  @relation(name: "PROJECTS_TAGS")
  }


  type Organization @crud {
    _id: ID!
    name: String!
    technologies: [Technology]  @relation(name: "TECHNOLOGIES_ORGANIZATIONS")
    projects: [Project]  @relation(name: "PROJECTS_ORGANIZATIONS")
    attachments: [Attachment]  @relation(name: "ORGANIZATIONS_ATTACHMENTS")
    tags: [Tag]  @relation(name: "ORGANIZATIONS_TAGS")
  }


  type Attachment @crud {
    _id: ID!
    name: String!
    technologies: [Technology]  @relation(name: "TECHNOLOGIES_ATTACHMENTS")
    projects: [Project]  @relation(name: "PROJECTS_ATTACHMENTS")
    organizations: [Organization]  @relation(name: "ORGANIZATIONS_ATTACHMENTS")
    tags: [Tag]  @relation(name: "ATTACHMENTS_TAGS")
  }

  type Tag @crud {
    _id: ID!
    name: String!
    technologies: [Technology]  @relation(name: "TECHNOLOGIES_TAGS")
    projects: [Project]  @relation(name: "PROJECTS_TAGS")
    organizations: [Organization]  @relation(name: "ORGANIZATIONS_TAGS")
    attachments: [Attachment]  @relation(name: "ATTACHMENTS_TAGS")
  }
`
