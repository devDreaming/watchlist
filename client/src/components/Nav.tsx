import { useState, useRef, useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { RiUserLine } from "react-icons/ri";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    apolloClient.clearStore();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        <div className="nav-user" ref={menuRef}>
          <button
            className="nav-user-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="User menu"
          >
            <RiUserLine size={18} />
          </button>
          {menuOpen && (
            <div className="nav-user-dropdown">
              <span className="nav-dropdown-email">{email}</span>
              <div className="nav-dropdown-divider" />
              <button className="nav-dropdown-logout" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
