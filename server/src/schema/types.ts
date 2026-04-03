import { builder } from "./builder";
import "./enums";

// Movie type
export const MovieType = builder.prismaObject("Movie", {
  fields: (t) => ({
    id: t.exposeID("id"),
    tmdbId: t.exposeInt("tmdbId"),
    title: t.exposeString("title"),
    overview: t.exposeString("overview"),
    posterPath: t.exposeString("posterPath", { nullable: true }),
    releaseDate: t.exposeString("releaseDate", { nullable: true }),
    runtime: t.exposeInt("runtime", { nullable: true }),
    genres: t.exposeStringList("genres"),
    createdAt: t.field({
      type: "String",
      resolve: (movie) => movie.createdAt.toISOString(),
    }),
  }),
});

// Show type
export const ShowType = builder.prismaObject("Show", {
  fields: (t) => ({
    id: t.exposeID("id"),
    tmdbId: t.exposeInt("tmdbId"),
    title: t.exposeString("title"),
    overview: t.exposeString("overview"),
    posterPath: t.exposeString("posterPath", { nullable: true }),
    firstAirDate: t.exposeString("firstAirDate", { nullable: true }),
    genres: t.exposeStringList("genres"),
    createdAt: t.field({
      type: "String",
      resolve: (show) => show.createdAt.toISOString(),
    }),
  }),
});

// Watchable union type — Movie has `runtime` field, Show does not
export const WatchableType = builder.unionType("Watchable", {
  types: [MovieType, ShowType],
  resolveType: (value) => {
    // `runtime` is a Movie-only field; its key always exists on Movie rows
    if ("runtime" in value) return "Movie";
    return "Show";
  },
});

// WatchlistItem type
export const WatchlistItemType = builder.prismaObject("WatchlistItem", {
  fields: (t) => ({
    id: t.exposeID("id"),
    mediaType: t.expose("mediaType", { type: "MediaType" }),
    status: t.expose("status", { type: "WatchStatus" }),
    rating: t.exposeInt("rating", { nullable: true }),
    createdAt: t.field({
      type: "String",
      resolve: (item) => item.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: "String",
      resolve: (item) => item.updatedAt.toISOString(),
    }),
    media: t.field({
      type: WatchableType,
      nullable: true,
      resolve: async (item, _args, ctx) => {
        if (item.mediaType === "MOVIE" && item.movieId) {
          return ctx.prisma.movie.findUnique({ where: { id: item.movieId } });
        }
        if (item.showId) {
          return ctx.prisma.show.findUnique({ where: { id: item.showId } });
        }
        return null;
      },
    }),
  }),
});

// Search result type (not a Prisma model)
export const SearchResultType = builder.objectType("SearchResult", {
  fields: (t) => ({
    tmdbId: t.int({ resolve: (r) => r.tmdbId }),
    mediaType: t.field({
      type: "MediaType",
      resolve: (r) => r.mediaType,
    }),
    title: t.string({ resolve: (r) => r.title }),
    overview: t.string({ resolve: (r) => r.overview }),
    posterPath: t.string({ nullable: true, resolve: (r) => r.posterPath }),
    releaseDate: t.string({ nullable: true, resolve: (r) => r.releaseDate }),
    firstAirDate: t.string({ nullable: true, resolve: (r) => r.firstAirDate }),
  }),
});
