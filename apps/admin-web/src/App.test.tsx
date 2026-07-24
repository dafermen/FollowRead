import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App.js";

describe("FollowRead Admin scaffold", () => {
  it("identifies the independent Admin application", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "FollowRead Admin" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Aplicación base disponible");
    expect(screen.getByRole("link", { name: "Ver documentación" })).toHaveAttribute(
      "href",
      "/documentation",
    );
  });

  it("renders the embedded developer documentation", () => {
    window.history.pushState({}, "", "/documentation");
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Documentación de FollowRead" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/npm install --global pnpm@11\.9\.0/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir documentación de la API" })).toHaveAttribute(
      "href",
      "http://localhost:8000/docs",
    );
    window.history.pushState({}, "", "/");
  });
});
