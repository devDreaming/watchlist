import { MediaType, WatchStatus } from "@prisma/client";
import { builder } from "./builder";
import { WatchlistItemType } from "./types";
import { fetchMovieDetail, fetchShowDetail } from "../tmdb";

builder.mutationField("addToWatchlist", (t) =>
  t.prismaField({
    type: WatchlistItemType,
    args: {
      tmdbId: t.arg.int({ required: true }),
      mediaType: t.arg({ type: "MediaType", required: true }),
      status: t.arg({ type: "WatchStatus", required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const { tmdbId, mediaType, status } = args;

      let mediaId: string;

      if (mediaType === MediaType.MOVIE) {
        const detail = await fetchMovieDetail(tmdbId);
        const movie = await ctx.prisma.movie.upsert({
          where: { tmdbId },
          update: {},
          create: {
            tmdbId: detail.id,
            title: detail.title,
            overview: detail.overview,
            posterPath: detail.poster_path ?? null,
            releaseDate: detail.release_date ?? null,
            runtime: detail.runtime ?? null,
            genres: detail.genres.map((g) => g.name),
          },
        });
        mediaId = movie.id;
      } else {
        const detail = await fetchShowDetail(tmdbId);
        const show = await ctx.prisma.show.upsert({
          where: { tmdbId },
          update: {},
          create: {
            tmdbId: detail.id,
            title: detail.name,
            overview: detail.overview,
            posterPath: detail.poster_path ?? null,
            firstAirDate: detail.first_air_date ?? null,
            genres: detail.genres.map((g) => g.name),
          },
        });
        mediaId = show.id;
      }

      return ctx.prisma.watchlistItem.create({
        ...query,
        data: {
          mediaType: mediaType as MediaType,
          ...(mediaType === MediaType.MOVIE ? { movieId: mediaId } : { showId: mediaId }),
          status: status as WatchStatus,
        },
      });
    },
  })
);

builder.mutationField("updateWatchlistItem", (t) =>
  t.prismaField({
    type: WatchlistItemType,
    args: {
      id: t.arg.string({ required: true }),
      status: t.arg({ type: "WatchStatus", required: false }),
      rating: t.arg.int({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const { id, status, rating } = args;
      return ctx.prisma.watchlistItem.update({
        ...query,
        where: { id },
        data: {
          ...(status != null ? { status: status as WatchStatus } : {}),
          ...(rating !== undefined ? { rating } : {}),
        },
      });
    },
  })
);

builder.mutationField("removeFromWatchlist", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      await ctx.prisma.watchlistItem.delete({ where: { id: args.id } });
      return true;
    },
  })
);
