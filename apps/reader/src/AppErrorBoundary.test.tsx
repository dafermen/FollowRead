import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { AppErrorBoundary } from "./AppErrorBoundary.js";

const BrokenView = () => {
  throw new Error("private failure detail");
};

afterEach(() => {
  vi.restoreAllMocks();
});

it("replaces an unexpected render failure with a safe recovery screen", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

  render(
    <AppErrorBoundary>
      <BrokenView />
    </AppErrorBoundary>,
  );

  expect(screen.getByRole("alert")).toHaveTextContent("Algo no salió como esperábamos");
  expect(screen.getByRole("button", { name: "Recargar FollowRead" })).toBeVisible();
  const structuredReport = consoleError.mock.calls
    .flat()
    .map(String)
    .find((entry) => entry.includes('"event":"frontend.failure"'));
  expect(structuredReport).toBeDefined();
  expect(structuredReport).not.toContain("private failure detail");
});
