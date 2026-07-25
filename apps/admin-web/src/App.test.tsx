import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App.js";

let scrollToMock: ReturnType<typeof vi.fn>;

describe("FollowRead Admin", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the visual dashboard preview", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Buenos días, Daniela" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Vista previa visual");
    expect(
      screen.getByRole("heading", { level: 2, name: "Contenido reciente" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Crear contenido/ })).toHaveAttribute(
      "href",
      "/content",
    );
  });

  it("shows the responsive content catalog", () => {
    window.history.pushState({}, "", "/content");
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Contenidos" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Contenidos" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar contenido" })).toBeInTheDocument();
    expect(screen.getByText("La casa de los sonidos")).toBeInTheDocument();
  });

  it("updates the active page when browser navigation changes", () => {
    render(<App />);

    act(() => {
      window.history.pushState({}, "", "/content");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.getByRole("heading", { level: 1, name: "Contenidos" })).toBeInTheDocument();
  });

  it("keeps pnpm setup and one-command startup in the embedded documentation", () => {
    window.history.pushState({}, "", "/documentation");
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Documentación de FollowRead" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/npm install --global pnpm@11\.9\.0/)).toBeInTheDocument();
    expect(screen.getByText("pnpm dev")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir documentación de la API" })).toHaveAttribute(
      "href",
      "http://localhost:8000/docs",
    );
  });

  it("shows the secure login form and toggles password visibility", () => {
    window.history.pushState({}, "", "/login");
    render(<App />);

    const password = screen.getByLabelText("Contraseña");
    expect(
      screen.getByRole("heading", { level: 2, name: "Bienvenida de nuevo" }),
    ).toBeInTheDocument();
    expect(password).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar contraseña" })).toBeInTheDocument();
  });

  it("reports invalid credentials without exposing account details", async () => {
    window.history.pushState({}, "", "/login");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    render(<App />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "editor@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "incorrecta" },
    });
    const form = screen.getByRole("button", { name: /Iniciar sesión/ }).closest("form");
    if (form === null) {
      throw new Error("The login form is required.");
    }
    fireEvent.submit(form);

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos iniciar sesión");
  });

  it("opens the dashboard after a valid login response", async () => {
    window.history.pushState({}, "", "/login");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    render(<App />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "editor@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "contraseña-segura" },
    });
    const form = screen.getByRole("button", { name: /Iniciar sesión/ }).closest("form");
    if (form === null) {
      throw new Error("The login form is required.");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Buenos días, Daniela" }),
      ).toBeInTheDocument();
    });
    expect(window.location.pathname).toBe("/");
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0 });
  });
});
