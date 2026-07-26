import { describe, expect, it, vi } from "vitest";

import { ReaderEngine } from "./engine.js";
import { chapterStartTime, clampTime, findActiveMarkIndex, validateTimeline } from "./timeline.js";
import type { ReaderTimeline } from "./types.js";

const timeline: ReaderTimeline = {
  durationMs: 2400,
  chapters: [
    { stableKey: "chapter-1", title: "One", paragraphKeys: ["p-1"] },
    { stableKey: "chapter-2", title: "Two", paragraphKeys: ["p-2"] },
  ],
  marks: [
    {
      value: "Hello",
      startMs: 0,
      endMs: 400,
      charStart: 0,
      charEnd: 5,
      paragraphKey: "p-1",
      chapterKey: "chapter-1",
    },
    {
      value: "world",
      startMs: 400,
      endMs: 900,
      charStart: 6,
      charEnd: 11,
      paragraphKey: "p-1",
      chapterKey: "chapter-1",
    },
    {
      value: "Again",
      startMs: 1200,
      endMs: 1700,
      charStart: 13,
      charEnd: 18,
      paragraphKey: "p-2",
      chapterKey: "chapter-2",
    },
  ],
};

describe("ReaderEngine", () => {
  it("loads, plays, highlights, skips and recovers progress", () => {
    const engine = new ReaderEngine();
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);

    expect(
      engine.load(timeline, { positionMs: 450, stableAnchor: "p-1", chapterKey: "chapter-1" }),
    ).toMatchObject({ status: "paused", activeMarkIndex: 1, activeChapterIndex: 0 });
    expect(engine.getActiveMark()?.value).toBe("world");
    engine.play();
    engine.tick(100);
    expect(engine.getState().currentTimeMs).toBe(550);
    engine.repeatActiveWord();
    expect(engine.getState()).toMatchObject({ currentTimeMs: 400, status: "playing" });
    engine.skip(900);
    expect(engine.getState()).toMatchObject({ currentTimeMs: 1300, activeChapterIndex: 1 });
    expect(engine.getProgress()).toEqual({
      positionMs: 1300,
      stableAnchor: "p-2",
      chapterKey: "chapter-2",
    });
    unsubscribe();
    expect(listener).toHaveBeenCalled();
  });

  it("controls rate, chapters, interruption, viewport and audio errors", () => {
    const engine = new ReaderEngine();
    engine.load(timeline);
    engine.setPlaybackRate(1.5);
    engine.changeChapter(1);
    expect(engine.getState()).toMatchObject({
      playbackRate: 1.5,
      currentTimeMs: 1200,
      activeChapterIndex: 1,
    });
    engine.changeChapter(-1);
    engine.play();
    engine.handleInterruption();
    expect(engine.getState().status).toBe("paused");
    expect(engine.handleViewportChange().layoutRevision).toBe(1);
    expect(engine.handleAudioLoss("offline")).toMatchObject({ status: "error", error: "offline" });
  });

  it("clamps time, ends playback and restarts from the beginning", () => {
    const engine = new ReaderEngine();
    engine.load(timeline);
    engine.play();
    engine.tick(5000);
    expect(engine.getState()).toMatchObject({ status: "ended", currentTimeMs: 2400 });
    engine.play();
    expect(engine.getState()).toMatchObject({ status: "playing", currentTimeMs: 0 });
    engine.pause();
    engine.toggle();
    expect(engine.getState().status).toBe("playing");
    engine.toggle();
    expect(engine.getState().status).toBe("paused");
  });

  it("rejects invalid timelines and invalid playback rates", () => {
    const firstMark = timeline.marks.at(0);
    expect(firstMark).toBeDefined();
    if (firstMark === undefined) {
      throw new Error("Test timeline requires a first mark.");
    }
    expect(() => validateTimeline({ ...timeline, durationMs: 0 })).toThrow(
      "reader.timeline.invalid_duration",
    );
    expect(() =>
      validateTimeline({
        ...timeline,
        marks: [{ ...firstMark, endMs: 2500 }],
      }),
    ).toThrow("reader.timeline.invalid_mark");
    expect(() =>
      validateTimeline({
        ...timeline,
        marks: [{ ...firstMark, chapterKey: "missing" }],
      }),
    ).toThrow("reader.timeline.unknown_chapter");
    const engine = new ReaderEngine();
    expect(() => engine.play()).toThrow("reader.timeline.not_loaded");
    engine.load(timeline);
    expect(() => engine.setPlaybackRate(3)).toThrow("reader.playback.invalid_rate");
  });

  it("keeps safe defaults before a word is active and with an empty timeline", () => {
    const engine = new ReaderEngine();
    expect(engine.getActiveMark()).toBeNull();
    expect(engine.getProgress()).toEqual({
      positionMs: 0,
      stableAnchor: null,
      chapterKey: null,
    });
    expect(engine.tick(100)).toBe(engine.getState());

    engine.load({ durationMs: 500, chapters: [], marks: [] });
    expect(engine.repeatActiveWord()).toBe(engine.getState());
    expect(engine.handleInterruption()).toBe(engine.getState());
    expect(engine.tick(0)).toBe(engine.getState());
    expect(engine.handleAudioLoss()).toMatchObject({
      status: "error",
      error: "reader.audio.unavailable",
    });
    expect(() => engine.setPlaybackRate(Number.NaN)).toThrow("reader.playback.invalid_rate");
  });
});

describe("timeline helpers", () => {
  it("finds marks and chapter boundaries deterministically", () => {
    expect(clampTime(-1, 100)).toBe(0);
    expect(clampTime(200, 100)).toBe(100);
    expect(findActiveMarkIndex(timeline.marks, -1)).toBe(-1);
    expect(findActiveMarkIndex(timeline.marks, 401)).toBe(1);
    expect(findActiveMarkIndex(timeline.marks, 1000)).toBe(-1);
    expect(chapterStartTime(timeline, 1)).toBe(1200);
    expect(chapterStartTime(timeline, 99)).toBe(0);
    expect(
      chapterStartTime(
        {
          durationMs: 2000,
          marks: [],
          chapters: [{ stableKey: "empty", title: null, paragraphKeys: [] }],
        },
        0,
      ),
    ).toBe(2000);
  });
});
