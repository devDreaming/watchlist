import { useState, useCallback } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { SEARCH_MEDIA, GET_WATCHLIST } from "../graphql/operations";
import MediaCard from "../components/MediaCard";
import "./SearchView.css";

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [searchMedia, { data, loading, error }] = useLazyQuery(SEARCH_MEDIA);
  const { data: watchlistData } = useQuery(GET_WATCHLIST);

  const watchlistTmdbIds = new Set<number>(
    (watchlistData?.watchlist ?? [])
      .map((item: { media: { tmdbId?: number } | null }) => item.media?.tmdbId)
      .filter(Boolean)
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        searchMedia({ variables: { query: query.trim() } });
      }
    },
    [query, searchMedia]
  );

  const results = data?.searchMedia ?? [];

  return (
    <div className="search-view">
      <h1 className="view-title">Search Movies & TV Shows</h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a movie or TV show..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn-search" disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p className="error-msg">Error: {error.message}</p>
      )}

      {results.length > 0 && (
        <div className="search-results">
          <p className="results-count">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          <div className="results-grid">
            {results.map((item: {
              tmdbId: number;
              mediaType: "MOVIE" | "SHOW";
              title: string;
              overview: string;
              posterPath: string | null;
              releaseDate: string | null;
              firstAirDate: string | null;
            }) => (
              <MediaCard
                key={`${item.mediaType}-${item.tmdbId}`}
                tmdbId={item.tmdbId}
                mediaType={item.mediaType}
                title={item.title}
                overview={item.overview}
                posterPath={item.posterPath}
                releaseDate={item.releaseDate}
                firstAirDate={item.firstAirDate}
                inWatchlist={watchlistTmdbIds.has(item.tmdbId)}
              />
            ))}
          </div>
        </div>
      )}

      {data && results.length === 0 && !loading && (
        <p className="empty-msg">No results found. Try a different search.</p>
      )}
    </div>
  );
}
