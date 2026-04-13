import { useState } from "react";
import Nav from "./components/Nav";
import SearchView from "./views/SearchView";
import WatchlistView from "./views/WatchlistView";
import AuthView from "./views/AuthView";
import { useAuth } from "./context/AuthContext";
import "./App.css";

type View = "search" | "watchlist";

export default function App() {
  const { token } = useAuth();
  const [view, setView] = useState<View>("search");

  if (!token) return <AuthView />;

  return (
    <div className="app">
      <Nav activeView={view} onNavigate={setView} />
      <main className="main">
        {view === "search" ? <SearchView /> : <WatchlistView />}
      </main>
    </div>
  );
}
