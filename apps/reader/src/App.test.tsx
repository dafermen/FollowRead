import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App.js";
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
          paragraphs: [{ stable_key: "paragraph-1", text: "Milo mira la luna." }],
        },
        {
          stable_key: "chapter-2",
          title: "El sendero brillante",
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
          paragraphs: [{ stable_key: "paragraph-1", text: "Milo watches the moon." }],
        },
        {
          stable_key: "chapter-2",
          title: "The Shining Path",
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
            start_ms: 800,
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

const respondWithStory = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response(JSON.stringify(storyPackage), { status: 200 }))),
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
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("presents the seeded bilingual story in the library", async () => {
    respondWithStory();
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Preparando la biblioteca");
    expect(await screen.findByRole("heading", { name: "El zorro y la luna" })).toBeInTheDocument();
    expect(screen.getByText("Cuento bilingüe")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Comenzar a leer/ })).toHaveAttribute(
      "href",
      "/read/el-zorro-y-la-luna",
    );
  });

  it("explains how to seed the demo when the API is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("pnpm demo:seed");
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
    window.localStorage.setItem("followread-progress-el-zorro-y-la-luna-es", "{invalid");
    window.history.pushState({}, "", "/read/el-zorro-y-la-luna");
    render(<App />);

    expect(screen.getByText("Preparando la lectura…")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Una luz en el bosque" }),
    ).toBeInTheDocument();

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
    expect(screen.getByRole("status")).toHaveTextContent("Leyendo: mira");
    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));

    fireEvent.change(screen.getByRole("combobox", { name: "Velocidad" }), {
      target: { value: "1.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capítulo siguiente" }));
    expect(screen.getByRole("heading", { name: "El sendero brillante" })).toBeInTheDocument();
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
      "/",
    );
  });
});
