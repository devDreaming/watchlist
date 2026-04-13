import { MediaType, WatchStatus } from "@prisma/client";
import { builder } from "./builder";

export { MediaType, WatchStatus };

export const MediaTypeEnum = builder.enumType(MediaType, {
  name: "MediaType",
});

export const WatchStatusEnum = builder.enumType(WatchStatus, {
  name: "WatchStatus",
});
