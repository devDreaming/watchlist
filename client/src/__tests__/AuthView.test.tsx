import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { graphql, HttpResponse } from "msw";
import { server } from "../test/server";
import { renderWithProviders } from "../test/utils";
import AuthView from "../views/AuthView";

describe("AuthView", () => {
  it("renders landing with Sign up and Log in buttons", async () => {
    renderWithProviders(<AuthView />);
    expect(await screen.findByRole("button", { name: "Sign up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("shows register form when Sign up is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthView />);
    await user.click(await screen.findByRole("button", { name: "Sign up" }));
    expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument();
  });

  it("shows login form when Log in is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthView />);
    await user.click(await screen.findByRole("button", { name: "Log in" }));
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Confirm password")).not.toBeInTheDocument();
  });

  it("back button returns to landing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthView />);
    await user.click(await screen.findByRole("button", { name: "Sign up" }));
    await user.click(screen.getByText("← Back"));
    expect(await screen.findByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("shows error when register passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthView />);
    await user.click(await screen.findByRole("button", { name: "Sign up" }));
    await user.type(screen.getByPlaceholderText("Email"), "a@b.com");
    await user.type(screen.getByPlaceholderText("Password"), "pass1");
    await user.type(screen.getByPlaceholderText("Confirm password"), "pass2");
    await user.click(screen.getByRole("button", { name: "Sign up" }));
    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("shows error on failed login", async () => {
    server.use(
      graphql.mutation("Login", () =>
        HttpResponse.json({ errors: [{ message: "Invalid credentials" }] })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<AuthView />);
    await user.click(await screen.findByRole("button", { name: "Log in" }));
    await user.type(screen.getByPlaceholderText("Email"), "a@b.com");
    await user.type(screen.getByPlaceholderText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
