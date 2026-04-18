import { render, type RenderOptions } from "@testing-library/react";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client";
import { AuthProvider } from "../context/AuthContext";
import type { ReactNode } from "react";

export function makeTestClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: "http://localhost/graphql" }),
    cache: new InMemoryCache(),
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  { apolloClient, ...options }: RenderOptions & { apolloClient?: ApolloClient<object> } = {}
) {
  const client = apolloClient ?? makeTestClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ApolloProvider client={client}>
        <AuthProvider>{children}</AuthProvider>
      </ApolloProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
