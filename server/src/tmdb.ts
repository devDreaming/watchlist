const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

export interface TmdbSearchResult {
  tmdbId: number;
  mediaType: "MOVIE" | "SHOW";
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string | null;
  firstAirDate: string | null;
}

export interface TmdbMovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string | null;
  runtime: number | null;
  genres: { id: number; name: string }[];
}

export interface TmdbShowDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string | null;
  genres: { id: number; name: string }[];
}

async function tmdbFetch<T>(path: string): Promise<T> {
  const url = `${TMDB_BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${getApiKey()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function searchTmdb(query: string): Promise<TmdbSearchResult[]> {
  const data = await tmdbFetch<{
    results: Array<{
      id: number;
      media_type: string;
      title?: string;
      name?: string;
      overview: string;
      poster_path: string | null;
      release_date?: string;
      first_air_date?: string;
    }>;
  }>(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);

  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => ({
      tmdbId: r.id,
      mediaType: r.media_type === "movie" ? "MOVIE" : "SHOW",
      title: r.title ?? r.name ?? "Unknown",
      overview: r.overview,
      posterPath: r.poster_path,
      releaseDate: r.release_date ?? null,
      firstAirDate: r.first_air_date ?? null,
    }));
}

export async function fetchMovieDetail(tmdbId: number): Promise<TmdbMovieDetail> {
  return tmdbFetch<TmdbMovieDetail>(`/movie/${tmdbId}`);
}

export async function fetchShowDetail(tmdbId: number): Promise<TmdbShowDetail> {
  return tmdbFetch<TmdbShowDetail>(`/tv/${tmdbId}`);
}
