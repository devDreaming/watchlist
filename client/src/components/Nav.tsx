import { useApolloClient } from "@apollo/client";
import { useAuth } from "../context/AuthContext";
import "./Nav.css";

type View = "search" | "watchlist";

interface NavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export default function Nav({ activeView, onNavigate }: NavProps) {
  const { email, logout } = useAuth();
  const apolloClient = useApolloClient();

  const handleLogout = () => {
    logout();
    apolloClient.clearStore();
  };

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
        <div className="nav-user">
          <span className="nav-email">{email}</span>
          <button className="nav-logout" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </nav>
  );
}
