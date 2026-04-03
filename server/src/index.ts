import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { createContext } from "./context";

const port = Number(process.env.PORT) || 4000;

const server = new ApolloServer({
  schema,
  introspection: true,
});

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async () => createContext(),
});

console.log(`GraphQL server ready at ${url}`);
