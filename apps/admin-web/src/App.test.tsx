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
    permissions: ["admin.access", "content.create", "content.edit"],
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

  it("loads and filters the authenticated editorial catalog", async () => {
    window.history.pushState({}, "", "/content");
    const catalogResponse = {
      items: [
        {
          id: "content-1",
          slug: "aventura-real",
          title: "Una aventura real",
          content_type: "story",
          audience: "children",
          languages: ["es", "en"],
          version: 2,
          status: "draft",
          updated_at: new Date().toISOString(),
          actions: ["view", "edit"],
        },
      ],
      total: 1,
      limit: 8,
      offset: 0,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(authenticatedSession),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(catalogResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ ...catalogResponse, items: [], total: 0 }),
      });
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    expect(await screen.findByText("Una aventura real")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar contenido" }), {
      target: { value: "inexistente" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(await screen.findByText("No encontramos contenidos")).toBeInTheDocument();
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain("search=inexistente");
  });

  it("creates a draft from the visual metadata form", async () => {
    window.history.pushState({}, "", "/content/new");
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Crear contenido" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Título principal"), {
      target: { value: "El viaje de Luna" },
    });
    expect(screen.getByLabelText(/Identificador URL/)).toHaveValue("el-viaje-de-luna");
    fireEvent.click(screen.getByLabelText(/Inglés/));
    fireEvent.click(screen.getByText("Aventura"));
    fireEvent.click(screen.getByRole("button", { name: "Crear borrador" }));

    expect(
      await screen.findByRole("heading", { level: 2, name: "El viaje de Luna" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Borrador creado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toHaveAttribute("href", "/content");
  });

  it("keeps pnpm setup and one-command startup in the embedded documentation", () => {
    window.history.pushState({}, "", "/documentation");
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Documentación de FollowRead" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/npm install --global pnpm@11\.9\.0/)).toBeInTheDocument();
    expect(screen.getAllByText("pnpm dev")).toHaveLength(2);
    expect(screen.getByText("OPENAI_API_KEY=tu_clave_aqui")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir documentación de la API" })).toHaveAttribute(
      "href",
      "http://localhost:8000/docs",
    );
  });

  it("edits, reorders and autosaves a structured draft", async () => {
    window.history.pushState({}, "", "/content/preview/edit");
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 2, name: "Estado del borrador" }),
    ).toBeInTheDocument();
    const paragraph = screen.getByLabelText("Párrafo 1");
    fireEvent.change(paragraph, {
      target: { value: "Milo siguió la luz entre los árboles." },
    });
    expect(screen.getByText("Cambios pendientes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bajar Una luz en el bosque" }));
    expect(screen.getByRole("button", { name: "Subir Una luz en el bosque" })).toBeEnabled();
    fireEvent.change(screen.getByLabelText("Descripción accesible"), {
      target: { value: "Un bosque iluminado por la luna." },
    });
    fireEvent.change(screen.getByLabelText("Añadir PNG, JPEG o WebP"), {
      target: { files: [new File(["png"], "forest.png", { type: "image/png" })] },
    });
    expect(screen.getByText("✓ Ilustración guardada")).toBeInTheDocument();
    expect(await screen.findByText("✓ Guardado", {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it("shows and controls the audio processing workspace", async () => {
    window.history.pushState({}, "", "/processing?version=version-2");
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Procesamiento" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Credenciales protegidas en la API")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Idioma"), { target: { value: "en" } });
    expect(screen.getByLabelText("Voz")).toHaveValue("cedar");
    fireEvent.click(screen.getByRole("button", { name: "Generar audio" }));
    expect(screen.getAllByRole("progressbar")).toHaveLength(4);
  });

  it("reviews, approves and publishes from the editorial board", async () => {
    window.history.pushState({}, "", "/reviews");
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Revisión y publicación" }),
    ).toBeInTheDocument();
    expect(screen.getByText("The River Between Us")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));
    const publishButtons = screen.getAllByRole("button", { name: "Publicar" });
    expect(publishButtons).toHaveLength(2);
    if (publishButtons[0] === undefined) {
      throw new Error("A publish action is required.");
    }
    fireEvent.click(publishButtons[0]);
    expect(screen.getAllByText("Publicado")).toHaveLength(2);
    const unpublishButtons = screen.getAllByRole("button", { name: "Despublicar" });
    if (unpublishButtons[0] === undefined) {
      throw new Error("An unpublish action is required.");
    }
    fireEvent.click(unpublishButtons[0]);
    expect(screen.getByText("Sin publicar")).toBeInTheDocument();
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
