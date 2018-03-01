import * as uuidv4 from 'uuid/v4'
import Session from 'neo4j-driver/types/v1/session'

export const insertNode = (session: Session, label: string, props: any) => session.run(
  `CREATE (a:${label} $props) RETURN a`, {
    props: {
      _id: uuidv4(),
      ...props,
    },
  }).then((result) => {
    const singleRecord = result.records[0];
    const node = singleRecord.get(0);
    return node.properties
})

export interface IEntityObject {
  entity: {
    properties: any,
  }
}

export const findSingle = (session: Session, query: string, variable: string) => session.run(query).then((result) => {
  if (result.records.length > 0) {
    return result.records[0].get(variable);
  } else {
    return null;
  }
})

export const findMultiple = (session: Session, query: string, variable: string) => session.run(query).then((result) => {
  return result.records.map((record) => record.get(variable))
})
