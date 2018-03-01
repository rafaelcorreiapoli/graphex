import { app } from './graphql';
import { session } from './neo4j';

// server.start(() => console.log('Server is running on localhost:4000'))
const PORT = 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(`Listening on http://localhost:${PORT}/graphiql`)
})
