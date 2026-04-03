/*
  Warnings:

  - You are about to drop the column `mediaId` on the `WatchlistItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WatchlistItem" DROP CONSTRAINT "watchlist_movie";

-- DropForeignKey
ALTER TABLE "WatchlistItem" DROP CONSTRAINT "watchlist_show";

-- AlterTable
ALTER TABLE "WatchlistItem" DROP COLUMN "mediaId",
ADD COLUMN     "movieId" TEXT,
ADD COLUMN     "showId" TEXT;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "watchlist_movie" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "watchlist_show" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL ON UPDATE CASCADE;
