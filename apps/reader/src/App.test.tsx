import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App.js";
import { sha256Checksum } from "./offlineDomain.js";
import { resetOfflineStateForTests } from "./offlineService.js";
import type { ReaderPackage } from "./readerClient.js";

const storyPackage: ReaderPackage = {
  content_id: "story-id",
  slug: "el-zorro-y-la-luna",
  version: 1,
  cover_uri: "/stories/el-zorro-y-la-luna-cover.png",
  cover_alt_text: "Milo y Luma bajo la luna.",
  translations: [
    {
      language: "es",
      title: "El zorro y la luna",
      summary: "Una pequeña luz puede guiar una gran amistad.",
      chapters: [
        {
          stable_key: "chapter-1",
          title: "Una luz en el bosque",
          image_uri: null,
          image_alt_text: null,
          paragraphs: [{ stable_key: "paragraph-1", text: "Milo mira la luna." }],
        },
        {
          stable_key: "chapter-2",
          title: "El sendero brillante",
          image_uri: "/stories/el-zorro-y-la-luna-chapter-2.png",
          image_alt_text: "Milo y Luma avanzan por el sendero brillante.",
          paragraphs: [{ stable_key: "paragraph-2", text: "Luma vuela con Milo." }],
        },
      ],
      audio: {
        uri: "var/audio/demo-es.mp3",
        duration_ms: 4000,
        voice_id: "Lucia",
        simulated: true,
        marks: [
          {
            value: "Milo",
            start_ms: 0,
            end_ms: 800,
            char_start: 0,
            char_end: 4,
            paragraph_key: "paragraph-1",
            chapter_key: "chapter-1",
          },
          {
            value: "mira",
            start_ms: 800,
            end_ms: 1600,
            char_start: 5,
            char_end: 9,
            paragraph_key: "paragraph-1",
            chapter_key: "chapter-1",
          },
          {
            value: "Luma",
            start_ms: 2000,
            end_ms: 2800,
            char_start: 20,
            char_end: 24,
            paragraph_key: "paragraph-2",
            chapter_key: "chapter-2",
          },
        ],
      },
    },
    {
      language: "en",
      title: "The Fox and the Moon",
      summary: "A little light can guide a great friendship.",
      chapters: [
        {
          stable_key: "chapter-1",
          title: "A Light in the Forest",
          image_uri: null,
          image_alt_text: null,
          paragraphs: [{ stable_key: "paragraph-1", text: "Milo watches the moon." }],
        },
        {
          stable_key: "chapter-2",
          title: "The Shining Path",
          image_uri: "/stories/el-zorro-y-la-luna-chapter-2.png",
          image_alt_text: "Milo and Luma follow the shining path.",
          paragraphs: [{ stable_key: "paragraph-2", text: "Luma flies with Milo." }],
        },
      ],
      audio: {
        uri: "var/audio/demo-en.mp3",
        duration_ms: 4000,
        voice_id: "Joanna",
        simulated: true,
        marks: [
          {
            value: "Milo",
            start_ms: 0,
            end_ms: 800,
            char_start: 0,
            char_end: 4,
            paragraph_key: "paragraph-1",
            chapter_key: "chapter-1",
          },
          {
            value: "watches",
            start_ms: 700,
            end_ms: 1600,
            char_start: 5,
            char_end: 12,
            paragraph_key: "paragraph-1",
            chapter_key: "chapter-1",
          },
          {
            value: "Luma",
            start_ms: 2000,
            end_ms: 2800,
            char_start: 22,
            char_end: 26,
            paragraph_key: "paragraph-2",
            chapter_key: "chapter-2",
          },
        ],
      },
    },
  ],
};
const storyPayload = JSON.stringify(storyPackage);
const storyChecksum = await sha256Checksum(storyPayload);

const catalogPage = {
  items: [
    {
      id: "story-id",
      slug: "el-zorro-y-la-luna",
      content_type: "story",
      audience: "children",
      reading_level: { code: "A1", label: "Inicial" },
      categories: [
        { slug: "adventure", name: "Aventura" },
        { slug: "friendship", name: "Amistad" },
      ],
      languages: ["es", "en"],
      version: 1,
      checksum: storyChecksum,
      package_url: "/catalog/el-zorro-y-la-luna/reader-package",
      minimum_app_version: "0.0.0",
      published_at: "2026-07-24T00:00:00Z",
    },
  ],
  total: 1,
  limit: 100,
  offset: 0,
};

const respondWithStory = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const body = url.endsWith("/offline/bootstrap.json")
        ? { schema_version: 1, catalog: [], package_payloads: {} }
        : url.includes("/reader/sync")
          ? { confirmed: [], rejected: [] }
          : url.includes("/reader-package")
            ? storyPackage
            : catalogPage;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }),
  );
};

describe("FollowRead Reader", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    window.localStorage.clear();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    resetOfflineStateForTests();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("presents the seeded bilingual story in the library", async () => {
    respondWithStory();
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Preparando tus lecturas");
    expect(
      await screen.findByRole("heading", { name: "Una aventura para esta noche" }),
    ).toBeInTheDocument();
    expect(screen.getByText("El zorro y la luna")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalles" })).toHaveAttribute(
      "href",
      "/details/el-zorro-y-la-luna",
    );
  });

  it("explains how to seed the demo when the API is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos abrir la biblioteca");
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeVisible();
  });

  it("renders the embedded developer documentation", () => {
    window.history.pushState({}, "", "/documentation");
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Documentación de FollowRead" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/npm install --global pnpm@11\.9\.0/)).toBeInTheDocument();
    expect(screen.getByText(/pnpm demo:seed/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir documentación de la API" })).toHaveAttribute(
      "href",
      "http://localhost:8000/docs",
    );
  });

  it("reads, pauses, navigates, changes speed and switches language", async () => {
    respondWithStory();
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      top: 200,
      bottom: 240,
      left: 100,
      right: 180,
      width: 80,
      height: 40,
      x: 100,
      y: 200,
      toJSON: () => ({}),
    });
    window.localStorage.setItem("followread-progress-el-zorro-y-la-luna-es", "{invalid");
    window.history.pushState({}, "", "/read/el-zorro-y-la-luna");
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Preparando esta pantalla");
    expect(
      await screen.findByRole("heading", { name: "Una luz en el bosque" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Milo y Luma bajo la luna." })).toHaveAttribute(
      "src",
      "/stories/el-zorro-y-la-luna-cover.png",
    );

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Reproducir" }));
    expect(screen.getByRole("button", { name: "Pausar" })).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    expect(screen.getByRole("button", { name: "Reproducir" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reproducir" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByText("mira")).toHaveClass("story-word--active");
    expect(screen.getByText("👆")).toHaveClass("reading-hand");
    expect(scrollIntoView).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));

    fireEvent.change(screen.getByRole("combobox", { name: "Velocidad" }), {
      target: { value: "1.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capítulo siguiente" }));
    expect(screen.getByRole("heading", { name: "El sendero brillante" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Milo y Luma avanzan por el sendero brillante." }),
    ).toHaveAttribute("src", "/stories/el-zorro-y-la-luna-chapter-2.png");
    fireEvent.click(screen.getByRole("button", { name: "Repetir palabra" }));
    fireEvent.click(screen.getByRole("button", { name: "Retroceder cinco segundos" }));
    fireEvent.click(screen.getByRole("button", { name: "Avanzar cinco segundos" }));
    fireEvent.click(screen.getByRole("button", { name: "Capítulo anterior" }));

    fireEvent.change(screen.getByRole("slider", { name: "Posición de lectura" }), {
      target: { value: "2000" },
    });
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("orientationchange"));

    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("heading", { name: "A Light in the Forest" })).toBeInTheDocument();
    expect(screen.getByText("Joanna")).toBeInTheDocument();
    expect(window.localStorage.getItem("followread-progress-el-zorro-y-la-luna-es")).not.toBeNull();
  });

  it("shows a recoverable reader error when the story cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(null, { status: 503 }))),
    );
    window.history.pushState({}, "", "/read/el-zorro-y-la-luna");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "No pudimos abrir el cuento" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Volver a la biblioteca" })).toHaveAttribute(
      "href",
      "/library",
    );
  });

  it("filters the library and resets an empty search", async () => {
    respondWithStory();
    window.history.pushState({}, "", "/library");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Encuentra tu próxima lectura" }),
    ).toBeVisible();
    expect(await screen.findByRole("link", { name: /El zorro y la luna/ })).toBeVisible();
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar" }), {
      target: { value: "inexistente" },
    });
    expect(screen.getByRole("heading", { name: "No encontramos lecturas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByRole("link", { name: /El zorro y la luna/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Aventura" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Idioma" }), {
      target: { value: "en" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Nivel" }), {
      target: { value: "A1" },
    });
    expect(screen.getByText("1 de 1")).toBeVisible();
  });

  it("shows details, saves a favorite and removes it from favorites", async () => {
    respondWithStory();
    window.history.pushState({}, "", "/details/el-zorro-y-la-luna");
    const view = render(<App />);

    expect(await screen.findByRole("heading", { name: "El zorro y la luna" })).toBeVisible();
    expect(screen.getByText("Inicial")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Guardar/ }));
    expect(screen.getByRole("button", { name: /En favoritos/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    view.unmount();
    window.history.pushState({}, "", "/favorites");
    render(<App />);
    expect(await screen.findByRole("heading", { name: "El zorro y la luna" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Quitar El zorro/ }));
    expect(screen.getByRole("heading", { name: "Todavía no guardaste favoritos" })).toBeVisible();
  });

  it("downloads a verified story and lists it in downloads", async () => {
    respondWithStory();
    window.history.pushState({}, "", "/details/el-zorro-y-la-luna");
    const view = render(<App />);

    expect(await screen.findByRole("heading", { name: "El zorro y la luna" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Descargar" }));
    expect(await screen.findByText(/ya está disponible sin conexión/)).toBeVisible();

    view.unmount();
    window.history.pushState({}, "", "/downloads");
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Descargas" })).toBeVisible();
    expect(await screen.findByRole("heading", { name: "El zorro y la luna" })).toBeVisible();
    expect(screen.getByText("Descargado")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar descarga" }));
    expect(await screen.findByRole("heading", { name: "Todavía no hay descargas" })).toBeVisible();
  });

  it("renders and clears reading history", () => {
    window.localStorage.setItem(
      "followread-reader-history-v1",
      JSON.stringify([
        {
          slug: "el-zorro-y-la-luna",
          title: "El zorro y la luna",
          coverUri: null,
          language: "es",
          positionMs: 2000,
          durationMs: 4000,
          chapterTitle: "Una luz en el bosque",
          updatedAt: "2026-07-24T00:00:00Z",
        },
      ]),
    );
    window.history.pushState({}, "", "/history");
    render(<App />);

    expect(screen.getByText(/50%/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    expect(screen.getByRole("heading", { name: "Tu historial está vacío" })).toBeVisible();
  });

  it("changes reading mode and restores settings", () => {
    window.history.pushState({}, "", "/settings");
    render(<App />);

    fireEvent.click(screen.getByRole("radio", { name: /Aprender inglés/ }));
    expect(screen.getByRole("heading", { name: "Aprender inglés" })).toBeVisible();
    fireEvent.change(screen.getByRole("combobox", { name: "Tema" }), {
      target: { value: "dark" },
    });
    fireEvent.click(screen.getByRole("switch", { name: /Reducir movimiento/ }));
    expect(document.documentElement.dataset["readerTheme"]).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "Restaurar valores iniciales" }));
    expect(screen.getByRole("heading", { name: "Modo infantil" })).toBeVisible();
  });

  it("shows and removes saved vocabulary", () => {
    window.localStorage.setItem(
      "followread-reader-vocabulary-v1",
      JSON.stringify([
        {
          id: "story:en:moon",
          slug: "story",
          word: "moon",
          translation: "luna",
          language: "en",
          savedAt: "2026-07-24T00:00:00Z",
        },
      ]),
    );
    window.history.pushState({}, "", "/vocabulary");
    render(<App />);

    expect(screen.getByRole("heading", { name: "moon" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Quitar moon" }));
    expect(screen.getByRole("heading", { name: "Aún no guardaste palabras" })).toBeVisible();
  });

  it("opens learning tools and saves a selected word", async () => {
    window.localStorage.setItem(
      "followread-reader-preferences-v1",
      JSON.stringify({
        mode: "learning",
        theme: "system",
        fontScale: 1.1,
        showPointer: true,
        autoScroll: false,
        reduceMotion: true,
        narrationEnabled: false,
        defaultLanguage: "en",
        playbackRate: 0.75,
      }),
    );
    respondWithStory();
    window.history.pushState({}, "", "/read/el-zorro-y-la-luna");
    render(<App />);

    await screen.findByRole("heading", { name: "A Light in the Forest" });
    expect(screen.getByText("Modo aprender inglés")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Mostrar traducción" }));
    expect(screen.getByText("Milo mira la luna.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "watches" }));
    expect(screen.getByRole("heading", { name: "watches" })).toBeVisible();
    expect(screen.getByText("mira")).toBeVisible();
    expect(screen.getByText(/En este cuento/)).toBeVisible();
    expect(screen.getByText("Milo watches the moon.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Guardar palabra/ }));
    expect(screen.getByRole("button", { name: /Guardada/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Marcar como palabra favorita" }));
    expect(screen.getByRole("button", { name: "Quitar de palabras favoritas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar ayuda de palabra" }));
    expect(screen.queryByRole("heading", { name: "watches" })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "watches" })).toHaveFocus();
    });
  });
});
