import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App.js";

describe("FollowRead Reader scaffold", () => {
  it("identifies the independent Reader application", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "FollowRead Reader" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Aplicación base disponible");
  });
});
