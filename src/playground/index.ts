import { server } from './graphql';
import { session } from './neo4j';

server.start(() => console.log('Server is running on localhost:4000'))
