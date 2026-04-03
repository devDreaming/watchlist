import { useState } from "react";
import Nav from "./components/Nav";
import SearchView from "./views/SearchView";
import WatchlistView from "./views/WatchlistView";
import "./App.css";

type View = "search" | "watchlist";

export default function App() {
  const [view, setView] = useState<View>("search");

  return (
    <div className="app">
      <Nav activeView={view} onNavigate={setView} />
      <main className="main">
        {view === "search" ? <SearchView /> : <WatchlistView />}
      </main>
    </div>
  );
}
