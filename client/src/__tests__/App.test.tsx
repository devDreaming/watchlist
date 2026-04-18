import { render, screen } from "@testing-library/react";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client";
import { AuthProvider } from "../context/AuthContext";
import App from "../App";

function renderApp() {
  const client = new ApolloClient({
    link: new HttpLink({ uri: "http://localhost/graphql" }),
    cache: new InMemoryCache(),
  });
  return render(
    <ApolloProvider client={client}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ApolloProvider>
  );
}

describe("App", () => {
  it("shows AuthView when there is no token", () => {
    renderApp();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("shows Nav when a token is present", () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("email", "user@test.com");
    renderApp();
    expect(screen.getByLabelText("User menu")).toBeInTheDocument();
    expect(screen.getByText("My Watchlist")).toBeInTheDocument();
  });
});
