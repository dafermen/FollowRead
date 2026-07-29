import { describe, expect, it, vi } from "vitest";

import {
  BrowserNarrator,
  markAtCharacter,
  monotonicBoundaryTime,
  narrationText,
} from "./browserNarrator.js";
import type { ReaderTranslation } from "./readerClient.js";

const translation: ReaderTranslation = {
  language: "es",
  title: "Demo",
  summary: null,
  chapters: [
    {
      stable_key: "chapter",
      title: "Uno",
      paragraphs: [
        { stable_key: "p1", text: "Hola luna" },
        { stable_key: "p2", text: "  " },
      ],
    },
  ],
  audio: {
    uri: "demo",
    duration_ms: 1000,
    voice_id: "device",
    simulated: true,
    marks: [
      {
        value: "Hola",
        start_ms: 0,
        end_ms: 500,
        char_start: 0,
        char_end: 4,
        paragraph_key: "p1",
        chapter_key: "chapter",
      },
      {
        value: "luna",
        start_ms: 500,
        end_ms: 1000,
        char_start: 5,
        char_end: 9,
        paragraph_key: "p1",
        chapter_key: "chapter",
      },
    ],
  },
};

describe("browser narration", () => {
  it("builds editorial narration text and finds word boundaries", () => {
    expect(narrationText(translation)).toBe("Hola luna");
    expect(markAtCharacter(translation.audio.marks, 1)?.value).toBe("Hola");
    expect(markAtCharacter(translation.audio.marks, 7)?.value).toBe("luna");
    expect(markAtCharacter(translation.audio.marks, 20)).toBeNull();
    expect(monotonicBoundaryTime(620, 1, 0, 0)).toBeNull();
    expect(monotonicBoundaryTime(620, 1, 1, 500)).toBe(620);
    expect(monotonicBoundaryTime(620, 1, 2, 900)).toBe(900);
  });

  it("returns a safe unavailable adapter", () => {
    const narrator = new BrowserNarrator(null, null);
    expect(narrator.available).toBe(false);
    expect(narrator.paused).toBe(false);
    expect(narrator.start(translation, 0, 1, callbacks())).toBe(false);
    expect(narrator.resume()).toBe(false);
    narrator.pause();
    narrator.stop();
  });

  it("speaks from a safe offset and forwards boundary, end and error events", () => {
    const utterance: {
      lang: string;
      rate: number;
      onboundary: ((event: { charIndex: number }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
    } = {
      lang: "",
      rate: 0,
      onboundary: null,
      onend: null,
      onerror: null,
    };
    const synthesis = {
      paused: false,
      speaking: true,
      speak: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
    };
    const factory = vi.fn(() => utterance);
    const events = callbacks();
    const narrator = new BrowserNarrator(synthesis, factory);

    expect(narrator.available).toBe(true);
    expect(narrator.start(translation, 5, 1.25, events)).toBe(true);
    expect(factory).toHaveBeenCalledWith("luna");
    expect(utterance).toMatchObject({ lang: "es-ES", rate: 1.25 });
    expect(synthesis.cancel).toHaveBeenCalled();
    expect(synthesis.speak).toHaveBeenCalledWith(utterance);
    utterance.onboundary?.({ charIndex: 1 });
    utterance.onboundary?.({ charIndex: 0 });
    utterance.onend?.();
    utterance.onerror?.();
    expect(events.onBoundary).toHaveBeenCalledWith(translation.audio.marks[1]);
    expect(events.onBoundary).toHaveBeenCalledTimes(1);
    expect(events.onEnd).toHaveBeenCalled();
    expect(events.onError).toHaveBeenCalled();
    narrator.pause();
    expect(synthesis.pause).toHaveBeenCalled();
    synthesis.paused = true;
    expect(narrator.paused).toBe(true);
    expect(narrator.resume()).toBe(true);
    expect(synthesis.resume).toHaveBeenCalled();
    narrator.stop();
  });
});

const callbacks = () => ({
  onBoundary: vi.fn(),
  onEnd: vi.fn(),
  onError: vi.fn(),
});
