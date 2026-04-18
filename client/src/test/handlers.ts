import { graphql, HttpResponse } from "msw";

export const handlers = [
  graphql.query("GetPopularPosters", () =>
    HttpResponse.json({ data: { popularPosters: ["/poster1.jpg", "/poster2.jpg"] } })
  ),

  graphql.mutation("Login", ({ variables }) =>
    HttpResponse.json({ data: { login: { token: "test-token", email: variables.email } } })
  ),

  graphql.mutation("Register", ({ variables }) =>
    HttpResponse.json({ data: { register: { token: "test-token", email: variables.email } } })
  ),

  graphql.query("GetWatchlist", () =>
    HttpResponse.json({ data: { watchlist: [] } })
  ),

  graphql.query("SearchMedia", () =>
    HttpResponse.json({ data: { searchMedia: [] } })
  ),

  graphql.mutation("AddToWatchlist", ({ variables }) =>
    HttpResponse.json({ data: { addToWatchlist: { id: "new-item", status: variables.status } } })
  ),

  graphql.mutation("UpdateWatchlistItem", ({ variables }) =>
    HttpResponse.json({ data: { updateWatchlistItem: { id: variables.id, status: variables.status ?? null, rating: variables.rating ?? null } } })
  ),

  graphql.mutation("RemoveFromWatchlist", () =>
    HttpResponse.json({ data: { removeFromWatchlist: "true" } })
  ),
];
