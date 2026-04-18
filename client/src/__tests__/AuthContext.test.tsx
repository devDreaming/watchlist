import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

function TestConsumer() {
  const { token, email, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? "null"}</span>
      <span data-testid="email">{email ?? "null"}</span>
      <button onClick={() => login("tok", "user@test.com")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  it("starts with null token and email", () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(screen.getByTestId("email")).toHaveTextContent("null");
  });

  it("initializes from localStorage", () => {
    localStorage.setItem("token", "saved-token");
    localStorage.setItem("email", "saved@test.com");
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId("token")).toHaveTextContent("saved-token");
    expect(screen.getByTestId("email")).toHaveTextContent("saved@test.com");
  });

  it("login updates context and persists to localStorage", () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    act(() => screen.getByText("Login").click());
    expect(screen.getByTestId("token")).toHaveTextContent("tok");
    expect(screen.getByTestId("email")).toHaveTextContent("user@test.com");
    expect(localStorage.getItem("token")).toBe("tok");
    expect(localStorage.getItem("email")).toBe("user@test.com");
  });

  it("logout clears context and localStorage", () => {
    localStorage.setItem("token", "tok");
    localStorage.setItem("email", "user@test.com");
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    act(() => screen.getByText("Logout").click());
    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(screen.getByTestId("email")).toHaveTextContent("null");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("email")).toBeNull();
  });

  it("useAuth throws when used outside AuthProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow("useAuth must be used within AuthProvider");
    consoleError.mockRestore();
  });
});
