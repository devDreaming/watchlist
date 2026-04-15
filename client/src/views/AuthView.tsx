import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { LOGIN, REGISTER, GET_POPULAR_POSTERS } from "../graphql/operations";
import { useAuth } from "../context/AuthContext";
import "./AuthView.css";

const TMDB_IMG = "https://image.tmdb.org/t/p/w342";
const NUM_COLUMNS = 4;

type Step = "landing" | "login" | "register";

function PosterBackdrop({ paths }: { paths: string[] }) {
  if (paths.length === 0) return null;

  // split posters across columns, duplicated for seamless loop
  const columns: string[][] = Array.from({ length: NUM_COLUMNS }, () => []);
  paths.forEach((p, i) => columns[i % NUM_COLUMNS].push(p));

  return (
    <div className="auth-posters" aria-hidden>
      {columns.map((col, ci) => (
        <div
          key={ci}
          className="auth-poster-col"
          style={{ animationDuration: `${28 + ci * 6}s`, animationDirection: ci % 2 === 1 ? "reverse" : "normal" }}
        >
          {/* duplicate for seamless loop */}
          {[...col, ...col].map((path, i) => (
            <img
              key={i}
              src={`${TMDB_IMG}${path}`}
              alt=""
              className="auth-poster-img"
              loading="lazy"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AuthView() {
  const [step, setStep] = useState<Step>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const { data: postersData } = useQuery<{ popularPosters: string[] }>(GET_POPULAR_POSTERS);
  const posterPaths = postersData?.popularPosters ?? [];

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);

  const loading = loginLoading || registerLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const mutation = step === "login" ? loginMutation : registerMutation;
      const { data } = await mutation({ variables: { email, password } });
      const payload = data?.login ?? data?.register;
      login(payload.token, payload.email);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong please try again");
    }
  };

  const goTo = (s: Step) => {
    setError(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setStep(s);
  };

  if (step === "landing") {
    return (
      <div className="auth-view">
        <PosterBackdrop paths={posterPaths} />
        <div className="auth-overlay" />
        <div className="auth-landing">
          <img src="/logo.svg" alt="Watchlist" className="auth-logo" />
          <p className="auth-tagline">
            Track movies and TV shows you want to watch, are currently watching,
            or have already seen. Rate what you've finished and keep everything
            in one place.
          </p>
          <div className="auth-cta">
            <button className="btn-auth" onClick={() => goTo("register")}>
              Sign up
            </button>
            <button className="btn-auth-secondary" onClick={() => goTo("login")}>
              Log in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-view">
      <PosterBackdrop paths={posterPaths} />
      <div className="auth-overlay" />
      <div className="auth-card">
        <div className="auth-card-header">
          <h2 className="auth-card-title">
            {step === "login" ? "Log in" : "Sign up"}
          </h2>
          <button className="btn-auth-back" onClick={() => goTo("landing")}>
            ← Back
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {step === "register" && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? "..." : step === "login" ? "Log in" : "Sign up"}
          </button>
        </form>
        <p className="auth-switch">
          {step === "login" ? (
            <>Don't have an account?{" "}
              <button className="btn-auth-link" onClick={() => goTo("register")}>Sign up</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button className="btn-auth-link" onClick={() => goTo("login")}>Log in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
