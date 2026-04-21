import { ApolloServer, HeaderMap } from "@apollo/server";
import { schema } from "./schema/index";
import { createContext } from "./context";
import express, { type Request, type Response } from "express";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "*", credentials: true }));
app.use(express.json());

const server = new ApolloServer({ schema, introspection: true });

const allowedOrigin = process.env.CLIENT_ORIGIN ?? "*";

function setCORSHeaders(req: Request, res: Response) {
  const requestOrigin = req.headers["origin"];
  const origin =
    allowedOrigin === "*" || requestOrigin === allowedOrigin
      ? (requestOrigin ?? "*")
      : allowedOrigin;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

server.start().then(() => {
  app.options("/graphql", (req: Request, res: Response) => {
    setCORSHeaders(req, res);
    res.sendStatus(204);
  });

  app.post("/graphql", async (req: Request, res: Response) => {
    setCORSHeaders(req, res);

    const headers = new HeaderMap();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
    }

    const result = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: { method: "POST", headers, search: "", body: req.body },
      context: () => Promise.resolve(createContext(req)),
    });

    res.status(result.status ?? 200);
    for (const [k, v] of result.headers) res.setHeader(k, v);

    if (result.body.kind === "complete") {
      res.send(result.body.string);
    } else {
      for await (const chunk of result.body.asyncIterator) res.write(chunk);
      res.end();
    }
  });

  app.listen(port, () => {
    console.log(`GraphQL server ready at http://localhost:${port}/graphql`);
  });
});
