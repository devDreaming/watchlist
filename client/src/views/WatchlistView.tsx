import { useQuery } from "@apollo/client";
import { GET_WATCHLIST } from "../graphql/operations";
import WatchlistCard from "../components/WatchlistCard";
import "./WatchlistView.css";

const STATUS_ORDER = ["WATCHING", "WANT_TO_WATCH", "COMPLETED", "DROPPED"] as const;
const STATUS_LABELS: Record<string, string> = {
  WANT_TO_WATCH: "Want to Watch",
  WATCHING: "Watching",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};

type WatchlistItem = {
  id: string;
  mediaType: string;
  status: string;
  rating: number | null;
  updatedAt: string;
  media: {
    title: string;
    posterPath: string | null;
    releaseDate?: string | null;
    firstAirDate?: string | null;
    genres: string[];
  } | null;
};

export default function WatchlistView() {
  const { data, loading, error } = useQuery(GET_WATCHLIST);

  if (loading) return <p className="status-msg">Loading watchlist...</p>;
  if (error) return <p className="status-msg error-msg">Error: {error.message}</p>;

  const items: WatchlistItem[] = data?.watchlist ?? [];

  if (items.length === 0) {
    return (
      <div className="watchlist-view">
        <h1 className="view-title">My Watchlist</h1>
        <p className="empty-msg">Your watchlist is empty. Search for movies or shows to add them.</p>
      </div>
    );
  }

  const grouped: Record<string, WatchlistItem[]> = {};
  for (const item of items) {
    if (!grouped[item.status]) grouped[item.status] = [];
    grouped[item.status].push(item);
  }

  return (
    <div className="watchlist-view">
      <h1 className="view-title">My Watchlist</h1>
      <p className="wl-count">{items.length} item{items.length !== 1 ? "s" : ""}</p>

      {STATUS_ORDER.filter((s) => grouped[s]?.length > 0).map((status) => (
        <section key={status} className="wl-section">
          <h2 className="wl-section-title">
            {STATUS_LABELS[status]}
            <span className="wl-section-count">{grouped[status].length}</span>
          </h2>
          <div className="wl-grid">
            {grouped[status].map((item) => (
              <WatchlistCard
                key={item.id}
                id={item.id}
                mediaType={item.mediaType}
                status={item.status}
                rating={item.rating}
                media={item.media}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
