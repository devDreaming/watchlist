import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema/index.js";
import { createContext } from "./context";

const port = Number(process.env.PORT) || 4000;

const server = new ApolloServer({
  schema,
  introspection: true,
});

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => createContext(req),
});

console.log(`GraphQL server ready at ${url}`);
