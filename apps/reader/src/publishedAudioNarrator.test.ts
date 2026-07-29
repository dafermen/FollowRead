import { describe, expect, it, vi } from "vitest";

import { PublishedAudioNarrator, resolvePublishedAudioUrl } from "./publishedAudioNarrator.js";
import type { ReaderTranslation } from "./readerClient.js";

const translation = (simulated: boolean): ReaderTranslation => ({
  language: "es",
  title: "Demo",
  summary: null,
  chapters: [],
  audio: {
    uri: "/audio/demo.mp3",
    duration_ms: 1200,
    voice_id: "marin",
    simulated,
    marks: [],
  },
});

describe("published audio narration", () => {
  it("resolves API-hosted audio without exposing any credential", () => {
    expect(resolvePublishedAudioUrl("/audio/demo.mp3")).toBe(
      "http://localhost:8000/audio/demo.mp3",
    );
    expect(resolvePublishedAudioUrl("https://cdn.example/demo.mp3")).toBe(
      "https://cdn.example/demo.mp3",
    );
  });

  it("plays real audio at the requested position and rate", () => {
    const audio = {
      currentTime: 0,
      playbackRate: 1,
      paused: true,
      src: "",
      onended: null as (() => void) | null,
      onerror: null as (() => void) | null,
      play: vi.fn(() => Promise.resolve()),
      pause: vi.fn(),
    };
    const callbacks = { onEnd: vi.fn(), onError: vi.fn() };
    const narrator = new PublishedAudioNarrator(audio);

    expect(narrator.canNarrate(translation(true))).toBe(false);
    expect(narrator.start(translation(true), 0, 1, callbacks)).toBe(false);
    expect(narrator.start(translation(false), 550, 1.25, callbacks)).toBe(true);
    expect(audio.src).toBe("http://localhost:8000/audio/demo.mp3");
    expect(audio.currentTime).toBe(0.55);
    expect(audio.playbackRate).toBe(1.25);
    expect(narrator.currentTimeMs).toBe(550);
    expect(audio.play).toHaveBeenCalledTimes(1);
    audio.onended?.();
    audio.onerror?.();
    expect(callbacks.onEnd).toHaveBeenCalled();
    expect(callbacks.onError).toHaveBeenCalled();

    expect(narrator.resume()).toBe(true);
    narrator.pause();
    narrator.stop();
    expect(audio.pause).toHaveBeenCalledTimes(2);
    expect(narrator.resume()).toBe(false);
  });
});
