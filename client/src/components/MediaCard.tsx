import { useState } from "react";
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
  genres?: string[];
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
  genres,
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

  const [expanded, setExpanded] = useState(false);
  const CHAR_LIMIT = 120;
  const isLong = overview.length > CHAR_LIMIT;

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
        <h3 className="media-card-title">{title}</h3>
        <div className="media-card-badge">{mediaType === "MOVIE" ? "Movie" : "TV Show"}</div>
        <p className="media-card-year">{year}</p>
        {genres && genres.length > 0 && (
          <p className="media-card-genres">{genres.slice(0, 3).join(", ")}</p>
        )}
        <p className="media-card-overview">
          {isLong && !expanded ? `${overview.slice(0, CHAR_LIMIT).trimEnd()}…` : (overview || "No description available.")}
          {isLong && (
            <button className="btn-show-more" onClick={() => setExpanded(!expanded)}>
              {expanded ? "show less" : "show more"}
            </button>
          )}
        </p>
        <button className="btn-add" onClick={handleAdd} disabled={loading || inWatchlist}>
          {loading ? "Adding..." : inWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
        </button>
      </div>
    </div>
  );
}
