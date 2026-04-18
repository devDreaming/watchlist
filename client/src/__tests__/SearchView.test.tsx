import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { graphql, HttpResponse } from "msw";
import { server } from "../test/server";
import { renderWithProviders } from "../test/utils";
import SearchView from "../views/SearchView";

const mockResults = [
  {
    tmdbId: 1,
    mediaType: "MOVIE",
    title: "Inception",
    overview: "A mind-bending thriller.",
    posterPath: null,
    releaseDate: "2010-07-16",
    firstAirDate: null,
    genres: ["Action", "Sci-Fi"],
  },
  {
    tmdbId: 2,
    mediaType: "SHOW",
    title: "Breaking Bad",
    overview: "A chemistry teacher turns to crime.",
    posterPath: null,
    releaseDate: null,
    firstAirDate: "2008-01-20",
    genres: ["Drama", "Crime"],
  },
];

describe("SearchView", () => {
  it("renders the search form", () => {
    renderWithProviders(<SearchView />);
    expect(screen.getByPlaceholderText("Search for a movie or TV show...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("disables the search button when input is empty", () => {
    renderWithProviders(<SearchView />);
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
  });

  it("enables the search button when input has text", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchView />);
    await user.type(screen.getByPlaceholderText("Search for a movie or TV show..."), "Inception");
    expect(screen.getByRole("button", { name: "Search" })).toBeEnabled();
  });

  it("displays results after a search", async () => {
    server.use(
      graphql.query("SearchMedia", () =>
        HttpResponse.json({ data: { searchMedia: mockResults } })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<SearchView />);
    await user.type(screen.getByPlaceholderText("Search for a movie or TV show..."), "test");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("Breaking Bad")).toBeInTheDocument();
    expect(screen.getByText("2 results")).toBeInTheDocument();
  });

  it("shows no results message when search returns empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchView />);
    await user.type(screen.getByPlaceholderText("Search for a movie or TV show..."), "xyzxyz");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("No results found. Try a different search.")).toBeInTheDocument();
  });

  it("shows error message on query failure", async () => {
    server.use(
      graphql.query("SearchMedia", () =>
        HttpResponse.json({ errors: [{ message: "Something went wrong" }] })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<SearchView />);
    await user.type(screen.getByPlaceholderText("Search for a movie or TV show..."), "test");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
  });

  it("calls AddToWatchlist mutation when Add to Watchlist is clicked", async () => {
    let capturedVariables: Record<string, unknown> = {};
    server.use(
      graphql.query("SearchMedia", () =>
        HttpResponse.json({ data: { searchMedia: mockResults } })
      ),
      graphql.mutation("AddToWatchlist", ({ variables }) => {
        capturedVariables = variables;
        return HttpResponse.json({ data: { addToWatchlist: { id: "new-item", status: "WANT_TO_WATCH" } } });
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<SearchView />);
    await user.type(screen.getByPlaceholderText("Search for a movie or TV show..."), "test");
    await user.click(screen.getByRole("button", { name: "Search" }));
    const addButtons = await screen.findAllByRole("button", { name: "+ Add to Watchlist" });
    await user.click(addButtons[0]);
    await waitFor(() => {
      expect(capturedVariables.tmdbId).toBe(1);
      expect(capturedVariables.mediaType).toBe("MOVIE");
      expect(capturedVariables.status).toBe("WANT_TO_WATCH");
    });
  });

  it("marks items already in the watchlist", async () => {
    server.use(
      graphql.query("SearchMedia", () =>
        HttpResponse.json({ data: { searchMedia: mockResults } })
      ),
      graphql.query("GetWatchlist", () =>
        HttpResponse.json({
          data: {
            watchlist: [{
              id: "wl-1",
              mediaType: "MOVIE",
              status: "WANT_TO_WATCH",
              rating: null,
              updatedAt: "2024-01-01T00:00:00Z",
              media: { __typename: "Movie", id: "m-1", tmdbId: 1, title: "Inception", overview: "", posterPath: null, releaseDate: "2010-07-16", genres: [] },
            }],
          },
        })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<SearchView />);
    await user.type(screen.getByPlaceholderText("Search for a movie or TV show..."), "test");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await screen.findByText("Inception");
    const buttons = screen.getAllByRole("button", { name: /Watchlist/ });
    expect(buttons[0]).toHaveTextContent("✓ In Watchlist");
    expect(buttons[0]).toBeDisabled();
  });
});
