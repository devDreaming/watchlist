import { WatchStatus } from "./enums";
import { builder } from "./builder";
import { WatchStatusEnum } from "./enums";
import { WatchlistItemType, SearchResultType } from "./types";
import { searchTmdb } from "../tmdb";

builder.queryField("watchlist", (t) =>
  t.prismaField({
    type: [WatchlistItemType],
    args: {
      status: t.arg({ type: WatchStatusEnum, required: false }),
    },
    resolve: (query, _root, args, ctx) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return ctx.prisma.watchlistItem.findMany({
        ...query,
        where: { userId: ctx.userId, ...(args.status ? { status: args.status as WatchStatus } : {}) },
        orderBy: { updatedAt: "desc" },
      });
    },
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
