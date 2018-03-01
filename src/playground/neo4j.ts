import neo4j from 'neo4j-driver'

const user = 'neo4j'
const password = 'q1w2e3'
const uri = 'bolt://localhost'

export const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
