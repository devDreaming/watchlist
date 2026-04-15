import { gql } from "@apollo/client";

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      email
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      email
    }
  }
`;

export const SEARCH_MEDIA = gql`
  query SearchMedia($query: String!) {
    searchMedia(query: $query) {
      tmdbId
      mediaType
      title
      overview
      posterPath
      releaseDate
      firstAirDate
      genres
    }
  }
`;

export const GET_WATCHLIST = gql`
  query GetWatchlist($status: WatchStatus) {
    watchlist(status: $status) {
      id
      mediaType
      status
      rating
      updatedAt
      media {
        ... on Movie {
          id
          tmdbId
          title
          overview
          posterPath
          releaseDate
          genres
        }
        ... on Show {
          id
          tmdbId
          title
          overview
          posterPath
          firstAirDate
          genres
        }
      }
    }
  }
`;

export const ADD_TO_WATCHLIST = gql`
  mutation AddToWatchlist($tmdbId: Int!, $mediaType: MediaType!, $status: WatchStatus!) {
    addToWatchlist(tmdbId: $tmdbId, mediaType: $mediaType, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_WATCHLIST_ITEM = gql`
  mutation UpdateWatchlistItem($id: String!, $status: WatchStatus, $rating: Int) {
    updateWatchlistItem(id: $id, status: $status, rating: $rating) {
      id
      status
      rating
    }
  }
`;

export const GET_POPULAR_POSTERS = gql`
  query GetPopularPosters {
    popularPosters
  }
`;

export const REMOVE_FROM_WATCHLIST = gql`
  mutation RemoveFromWatchlist($id: String!) {
    removeFromWatchlist(id: $id)
  }
`;
