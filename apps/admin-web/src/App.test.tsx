import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App.js";

describe("FollowRead Admin scaffold", () => {
  it("identifies the independent Admin application", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "FollowRead Admin" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Aplicación base disponible");
  });
});
