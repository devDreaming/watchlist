import { useMutation } from "@apollo/client";
import { ADD_TO_WATCHLIST, GET_WATCHLIST } from "../graphql/operations";
import "./MediaCard.css";

const POSTER_BASE = "https://image.tmdb.org/t/p/w300";

interface MediaCardProps {
  tmdbId: number;
  mediaType: "MOVIE" | "SHOW";
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate?: string | null;
  firstAirDate?: string | null;
  inWatchlist?: boolean;
}

function getYear(date?: string | null): string {
  if (!date) return "—";
  return date.slice(0, 4);
}

export default function MediaCard({
  tmdbId,
  mediaType,
  title,
  overview,
  posterPath,
  releaseDate,
  firstAirDate,
  inWatchlist = false,
}: MediaCardProps) {
  const [addToWatchlist, { loading }] = useMutation(ADD_TO_WATCHLIST, {
    refetchQueries: [{ query: GET_WATCHLIST }],
  });

  const handleAdd = () => {
    addToWatchlist({
      variables: { tmdbId, mediaType, status: "WANT_TO_WATCH" },
    });
  };

  const year = getYear(releaseDate ?? firstAirDate);

  return (
    <div className="media-card">
      <div className="media-card-poster">
        {posterPath ? (
          <img src={`${POSTER_BASE}${posterPath}`} alt={title} loading="lazy" />
        ) : (
          <div className="media-card-no-poster">No Image</div>
        )}
      </div>
      <div className="media-card-info">
        <div className="media-card-badge">{mediaType === "MOVIE" ? "Movie" : "TV Show"}</div>
        <h3 className="media-card-title">{title}</h3>
        <p className="media-card-year">{year}</p>
        <p className="media-card-overview">{overview || "No description available."}</p>
        <button className="btn-add" onClick={handleAdd} disabled={loading || inWatchlist}>
          {loading ? "Adding..." : inWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
        </button>
      </div>
    </div>
  );
}
