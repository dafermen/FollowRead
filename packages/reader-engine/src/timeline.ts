import type { ReaderSpeechMark, ReaderTimeline } from "./types.js";

export const clampTime = (timeMs: number, durationMs: number): number =>
  Math.min(Math.max(timeMs, 0), Math.max(durationMs, 0));

export const validateTimeline = (timeline: ReaderTimeline): ReaderTimeline => {
  if (!Number.isFinite(timeline.durationMs) || timeline.durationMs <= 0) {
    throw new Error("reader.timeline.invalid_duration");
  }
  let previousEnd = 0;
  for (const mark of timeline.marks) {
    if (
      mark.startMs < previousEnd ||
      mark.endMs < mark.startMs ||
      mark.endMs > timeline.durationMs ||
      mark.paragraphKey === "" ||
      mark.chapterKey === ""
    ) {
      throw new Error("reader.timeline.invalid_mark");
    }
    previousEnd = mark.endMs;
  }
  const chapterKeys = new Set(timeline.chapters.map((chapter) => chapter.stableKey));
  if (timeline.marks.some((mark) => !chapterKeys.has(mark.chapterKey))) {
    throw new Error("reader.timeline.unknown_chapter");
  }
  return timeline;
};

export const findActiveMarkIndex = (
  marks: readonly ReaderSpeechMark[],
  currentTimeMs: number,
): number => {
  const firstMark = marks.at(0);
  if (firstMark === undefined || currentTimeMs < firstMark.startMs) {
    return -1;
  }
  let low = 0;
  let high = marks.length - 1;
  let candidate = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const mark = marks[middle];
    if (mark === undefined) {
      return -1;
    }
    if (mark.startMs <= currentTimeMs) {
      candidate = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  const active = candidate < 0 ? undefined : marks[candidate];
  return active !== undefined && currentTimeMs < active.endMs ? candidate : -1;
};

export const chapterStartTime = (timeline: ReaderTimeline, chapterIndex: number): number => {
  const chapter = timeline.chapters[chapterIndex];
  if (chapter === undefined) {
    return 0;
  }
  return (
    timeline.marks.find((mark) => mark.chapterKey === chapter.stableKey)?.startMs ??
    (chapterIndex === timeline.chapters.length - 1 ? timeline.durationMs : 0)
  );
};
