import "./Nav.css";

type View = "search" | "watchlist";

interface NavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export default function Nav({ activeView, onNavigate }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="nav-logo">Watchlist</span>
        <div className="nav-links">
          <button
            className={`nav-link ${activeView === "search" ? "active" : ""}`}
            onClick={() => onNavigate("search")}
          >
            Search
          </button>
          <button
            className={`nav-link ${activeView === "watchlist" ? "active" : ""}`}
            onClick={() => onNavigate("watchlist")}
          >
            My Watchlist
          </button>
        </div>
      </div>
    </nav>
  );
}
