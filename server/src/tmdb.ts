const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};

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
  genres: string[];
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
      genre_ids?: number[];
    }>;
  }>(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);

  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => ({
      tmdbId: r.id,
      mediaType: r.media_type === "movie" ? "MOVIE" : "SHOW" as "MOVIE" | "SHOW",
      title: r.title ?? r.name ?? "Unknown",
      overview: r.overview,
      posterPath: r.poster_path,
      releaseDate: r.release_date ?? null,
      firstAirDate: r.first_air_date ?? null,
      genres: (r.genre_ids ?? []).map((id) => GENRE_MAP[id]).filter(Boolean),
    }));
}

export async function fetchMovieDetail(tmdbId: number): Promise<TmdbMovieDetail> {
  return tmdbFetch<TmdbMovieDetail>(`/movie/${tmdbId}`);
}

export async function fetchShowDetail(tmdbId: number): Promise<TmdbShowDetail> {
  return tmdbFetch<TmdbShowDetail>(`/tv/${tmdbId}`);
}
