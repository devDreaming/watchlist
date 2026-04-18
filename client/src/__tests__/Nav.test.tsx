import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { renderWithProviders } from "../test/utils";
import Nav from "../components/Nav";

function makeClientWithSpy() {
  const client = new ApolloClient({
    link: new HttpLink({ uri: "http://localhost/graphql" }),
    cache: new InMemoryCache(),
  });
  const resetStore = vi.spyOn(client, "resetStore").mockResolvedValue(null);
  return { client, resetStore };
}

describe("Nav", () => {
  beforeEach(() => {
    localStorage.setItem("token", "tok");
    localStorage.setItem("email", "user@example.com");
  });

  it("opens dropdown and shows email on user button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Nav activeView="search" onNavigate={() => {}} />);
    await user.click(screen.getByLabelText("User menu"));
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("logout clears auth and calls resetStore", async () => {
    const user = userEvent.setup();
    const { client, resetStore } = makeClientWithSpy();
    renderWithProviders(<Nav activeView="search" onNavigate={() => {}} />, { apolloClient: client });
    await user.click(screen.getByLabelText("User menu"));
    await user.click(screen.getByText("Sign out"));
    expect(localStorage.getItem("token")).toBeNull();
    expect(resetStore).toHaveBeenCalled();
  });

  it("nav links call onNavigate with the correct view", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderWithProviders(<Nav activeView="search" onNavigate={onNavigate} />);
    await user.click(screen.getByText("My Watchlist"));
    expect(onNavigate).toHaveBeenCalledWith("watchlist");
    await user.click(screen.getByText("Search"));
    expect(onNavigate).toHaveBeenCalledWith("search");
  });
});
