import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "../App.js";
import { PasswordResetPage } from "./PasswordResetPage.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

it("removes the token from the URL and submits matching passwords once", async () => {
  window.history.replaceState({}, "", "/reset-password#token=synthetic-one-use-token");
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetcher);
  render(<App />);
  expect(window.location.hash).toBe("");
  fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
    target: { value: "a sufficiently long password" },
  });
  fireEvent.change(screen.getByLabelText("Confirma la contraseña"), {
    target: { value: "a sufficiently long password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Guardar contraseña" }));
  await screen.findByText("Contraseña actualizada. Ya puedes iniciar sesión.");
  expect(fetcher).toHaveBeenCalledTimes(1);
  const body = fetcher.mock.calls[0]?.[1]?.body;
  expect(typeof body).toBe("string");
  expect(JSON.parse(typeof body === "string" ? body : "{}")).toEqual({
    token: "synthetic-one-use-token",
    password: "a sufficiently long password",
  });
});

it("does not claim to send mail when delivery is unavailable", async () => {
  window.history.replaceState({}, "", "/reset-password");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
  render(<PasswordResetPage />);
  fireEvent.change(screen.getByLabelText("Correo electrónico"), {
    target: { value: "owner@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Solicitar enlace" }));
  await waitFor(() => {
    expect(screen.getByRole("status")).toHaveTextContent(
      "Solicita un enlace de recuperación al responsable del servicio.",
    );
  });
});
