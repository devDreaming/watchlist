import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema/index";
import { createContext } from "./context";

const port = Number(process.env.PORT) || 4000;

const server = new ApolloServer({
  schema,
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => createContext(req),
}).then(({ url }) => {
  console.log(`GraphQL server ready at ${url}`);
});
