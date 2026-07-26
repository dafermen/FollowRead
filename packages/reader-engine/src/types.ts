export type ReaderPlaybackStatus = "idle" | "playing" | "paused" | "ended" | "error";

export type ReaderSpeechMark = {
  value: string;
  startMs: number;
  endMs: number;
  charStart: number;
  charEnd: number;
  paragraphKey: string;
  chapterKey: string;
};

export type ReaderChapter = {
  stableKey: string;
  title: string | null;
  paragraphKeys: string[];
};

export type ReaderTimeline = {
  durationMs: number;
  marks: ReaderSpeechMark[];
  chapters: ReaderChapter[];
};

export type ReaderProgress = {
  positionMs: number;
  stableAnchor: string | null;
  chapterKey: string | null;
};

export type ReaderEngineState = {
  status: ReaderPlaybackStatus;
  currentTimeMs: number;
  durationMs: number;
  playbackRate: number;
  activeMarkIndex: number;
  activeChapterIndex: number;
  layoutRevision: number;
  error: string | null;
};

export type ReaderEngineListener = (state: ReaderEngineState) => void;
