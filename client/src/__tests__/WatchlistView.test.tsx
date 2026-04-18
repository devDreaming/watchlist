import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { graphql, HttpResponse } from "msw";
import { server } from "../test/server";
import { renderWithProviders } from "../test/utils";
import WatchlistView from "../views/WatchlistView";

let _itemCounter = 0;
const makeItem = (overrides: Partial<{
  id: string;
  mediaType: string;
  status: string;
  rating: number | null;
  title: string;
}> = {}) => {
  const n = ++_itemCounter;
  return {
    id: overrides.id ?? `item-${n}`,
    mediaType: overrides.mediaType ?? "MOVIE",
    status: overrides.status ?? "WANT_TO_WATCH",
    rating: overrides.rating ?? null,
    updatedAt: "2024-01-01T00:00:00Z",
    media: {
      __typename: "Movie",
      id: `movie-${n}`,
      tmdbId: 100 + n,
      title: overrides.title ?? "Test Movie",
      overview: "A test movie.",
      posterPath: null,
      releaseDate: "2023-06-01",
      genres: ["Action"],
    },
  };
};

beforeEach(() => { _itemCounter = 0; });

describe("WatchlistView", () => {
  it("shows empty state when watchlist is empty", async () => {
    renderWithProviders(<WatchlistView />);
    expect(await screen.findByText(/Your watchlist is empty/)).toBeInTheDocument();
  });

  it("renders items and shows total count", async () => {
    server.use(
      graphql.query("GetWatchlist", () =>
        HttpResponse.json({ data: { watchlist: [makeItem(), makeItem({ id: "item-2", title: "Another Movie" })] } })
      )
    );
    renderWithProviders(<WatchlistView />);
    expect(await screen.findByText("Test Movie")).toBeInTheDocument();
    expect(screen.getByText("Another Movie")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("groups items under correct status sections", async () => {
    server.use(
      graphql.query("GetWatchlist", () =>
        HttpResponse.json({
          data: {
            watchlist: [
              makeItem({ id: "1", status: "WATCHING", title: "Watching Movie" }),
              makeItem({ id: "2", status: "COMPLETED", title: "Done Movie" }),
            ],
          },
        })
      )
    );
    renderWithProviders(<WatchlistView />);
    expect(await screen.findByRole("heading", { level: 2, name: /^Watching/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /^Completed/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: /^Want to Watch/ })).not.toBeInTheDocument();
  });

  it("shows CookieRating only for COMPLETED items", async () => {
    server.use(
      graphql.query("GetWatchlist", () =>
        HttpResponse.json({
          data: {
            watchlist: [
              makeItem({ id: "1", status: "WATCHING", title: "Watching Movie" }),
              makeItem({ id: "2", status: "COMPLETED", title: "Done Movie" }),
            ],
          },
        })
      )
    );
    renderWithProviders(<WatchlistView />);
    await screen.findByText("Done Movie");
    expect(screen.getAllByLabelText(/Rate \d out of 5/)).toHaveLength(5);
  });

  it("calls UpdateWatchlistItem when status is changed", async () => {
    let capturedVariables: Record<string, unknown> = {};
    server.use(
      graphql.query("GetWatchlist", () =>
        HttpResponse.json({ data: { watchlist: [makeItem()] } })
      ),
      graphql.mutation("UpdateWatchlistItem", ({ variables }) => {
        capturedVariables = variables;
        return HttpResponse.json({ data: { updateWatchlistItem: { id: "item-1", status: variables.status, rating: null } } });
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<WatchlistView />);
    await screen.findByText("Test Movie");
    await user.selectOptions(screen.getByRole("combobox"), "WATCHING");
    await waitFor(() => expect(capturedVariables.status).toBe("WATCHING"));
  });

  it("calls RemoveFromWatchlist when remove is clicked", async () => {
    let removeCalled = false;
    server.use(
      graphql.query("GetWatchlist", () =>
        HttpResponse.json({ data: { watchlist: [makeItem()] } })
      ),
      graphql.mutation("RemoveFromWatchlist", () => {
        removeCalled = true;
        return HttpResponse.json({ data: { removeFromWatchlist: "true" } });
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<WatchlistView />);
    await screen.findByText("Test Movie");
    await user.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(removeCalled).toBe(true));
  });
});
