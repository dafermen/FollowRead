import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App.js";

let scrollToMock: ReturnType<typeof vi.fn>;

const authenticatedSession = {
  user: {
    id: "user-1",
    email: "editor@example.com",
    display_name: "Daniela Editora",
    roles: ["editor"],
    permissions: ["admin.access", "content.read", "content.write"],
  },
};

const emptyDashboardSummary = {
  metrics: { total: 0, drafts: 0, in_review: 0, published: 0 },
  attention: { reviews: 0, failed_jobs: 0 },
  recent_content: [],
  activity: [],
};

describe("FollowRead Admin", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("API unavailable in preview")));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the visual dashboard preview", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Buenos días, Daniela" }),
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

  it("shows the responsive content catalog", async () => {
    window.history.pushState({}, "", "/content");
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Contenidos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Contenidos" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar contenido" })).toBeInTheDocument();
    expect(screen.getByText("La casa de los sonidos")).toBeInTheDocument();
  });

  it("updates the active page when browser navigation changes", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1, name: "Buenos días, Daniela" });

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
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue(authenticatedSession),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue(authenticatedSession),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue(emptyDashboardSummary),
        }),
    );
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

  it("closes an authenticated session and returns to login", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue(authenticatedSession),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue(emptyDashboardSummary),
        })
        .mockResolvedValueOnce({ ok: true, status: 204 }),
    );
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Buenos días, Daniela" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("El catálogo todavía está vacío")).toBeInTheDocument();
    const [logoutButton] = screen.getAllByRole("button", { name: "Cerrar sesión" });
    if (logoutButton === undefined) {
      throw new Error("The logout button is required.");
    }
    fireEvent.click(logoutButton);

    expect(
      await screen.findByRole("heading", { level: 2, name: "Bienvenida de nuevo" }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
  });
});
