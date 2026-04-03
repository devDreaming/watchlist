import { useMutation } from "@apollo/client";
import { UPDATE_WATCHLIST_ITEM, REMOVE_FROM_WATCHLIST, GET_WATCHLIST } from "../graphql/operations";
import "./WatchlistCard.css";

const POSTER_BASE = "https://image.tmdb.org/t/p/w300";

const STATUS_LABELS: Record<string, string> = {
  WANT_TO_WATCH: "Want to Watch",
  WATCHING: "Watching",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};

interface WatchlistCardProps {
  id: string;
  mediaType: string;
  status: string;
  rating: number | null;
  media: {
    title: string;
    posterPath: string | null;
    releaseDate?: string | null;
    firstAirDate?: string | null;
    genres: string[];
  } | null;
}

export default function WatchlistCard({ id, mediaType, status, rating, media }: WatchlistCardProps) {
  const [updateItem] = useMutation(UPDATE_WATCHLIST_ITEM, {
    refetchQueries: [{ query: GET_WATCHLIST }],
  });
  const [removeItem, { loading: removing }] = useMutation(REMOVE_FROM_WATCHLIST, {
    refetchQueries: [{ query: GET_WATCHLIST }],
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateItem({ variables: { id, status: e.target.value } });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 10) {
      updateItem({ variables: { id, rating: val } });
    } else if (e.target.value === "") {
      updateItem({ variables: { id, rating: null } });
    }
  };

  const handleRemove = () => {
    removeItem({ variables: { id } });
  };

  if (!media) return null;

  const year = (media.releaseDate ?? media.firstAirDate ?? "").slice(0, 4) || "—";

  return (
    <div className="watchlist-card">
      <div className="wl-poster">
        {media.posterPath ? (
          <img src={`${POSTER_BASE}${media.posterPath}`} alt={media.title} loading="lazy" />
        ) : (
          <div className="wl-no-poster">No Image</div>
        )}
      </div>
      <div className="wl-info">
        <div className="wl-type-badge">{mediaType === "MOVIE" ? "Movie" : "TV Show"}</div>
        <h3 className="wl-title">{media.title}</h3>
        <p className="wl-year">{year}</p>
        {media.genres.length > 0 && (
          <p className="wl-genres">{media.genres.slice(0, 3).join(", ")}</p>
        )}
        <div className="wl-controls">
          <select value={status} onChange={handleStatusChange}>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <div className="wl-rating">
            <label htmlFor={`rating-${id}`}>Rating</label>
            <input
              id={`rating-${id}`}
              type="number"
              min={1}
              max={10}
              placeholder="—"
              defaultValue={rating ?? ""}
              onBlur={handleRatingChange}
              className="rating-input"
            />
            <span>/10</span>
          </div>
        </div>
        <button className="btn-remove" onClick={handleRemove} disabled={removing}>
          {removing ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
