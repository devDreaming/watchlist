import { WatchStatus } from "@prisma/client";
import { builder } from "./builder";
import { WatchlistItemType, SearchResultType } from "./types";
import { searchTmdb } from "../tmdb";

builder.queryField("watchlist", (t) =>
  t.prismaField({
    type: [WatchlistItemType],
    args: {
      status: t.arg({ type: "WatchStatus", required: false }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.watchlistItem.findMany({
        ...query,
        where: args.status ? { status: args.status as WatchStatus } : undefined,
        orderBy: { updatedAt: "desc" },
      }),
  })
);

builder.queryField("searchMedia", (t) =>
  t.field({
    type: [SearchResultType],
    args: {
      query: t.arg.string({ required: true }),
    },
    resolve: async (_root, args) => {
      return searchTmdb(args.query);
    },
  })
);
