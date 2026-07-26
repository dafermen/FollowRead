import { chapterStartTime, clampTime, findActiveMarkIndex, validateTimeline } from "./timeline.js";
import type {
  ReaderEngineListener,
  ReaderEngineState,
  ReaderProgress,
  ReaderSpeechMark,
  ReaderTimeline,
} from "./types.js";

const INITIAL_STATE: ReaderEngineState = {
  status: "idle",
  currentTimeMs: 0,
  durationMs: 0,
  playbackRate: 1,
  activeMarkIndex: -1,
  activeChapterIndex: 0,
  layoutRevision: 0,
  error: null,
};

export class ReaderEngine {
  private timeline: ReaderTimeline | null = null;
  private state: ReaderEngineState = INITIAL_STATE;
  private readonly listeners = new Set<ReaderEngineListener>();

  load(timeline: ReaderTimeline, progress?: ReaderProgress): ReaderEngineState {
    this.timeline = validateTimeline(timeline);
    const recoveredTime = clampTime(progress?.positionMs ?? 0, timeline.durationMs);
    this.state = {
      ...INITIAL_STATE,
      status: recoveredTime >= timeline.durationMs ? "ended" : "paused",
      currentTimeMs: recoveredTime,
      durationMs: timeline.durationMs,
      activeMarkIndex: findActiveMarkIndex(timeline.marks, recoveredTime),
      activeChapterIndex: this.chapterIndexAt(recoveredTime),
    };
    return this.emit();
  }

  subscribe(listener: ReaderEngineListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): ReaderEngineState {
    return this.state;
  }

  getActiveMark(): ReaderSpeechMark | null {
    if (this.timeline === null || this.state.activeMarkIndex < 0) {
      return null;
    }
    return this.timeline.marks[this.state.activeMarkIndex] ?? null;
  }

  play(): ReaderEngineState {
    const timeline = this.requireTimeline();
    const currentTimeMs =
      this.state.status === "ended"
        ? 0
        : clampTime(this.state.currentTimeMs, this.state.durationMs);
    this.state = {
      ...this.state,
      status: "playing",
      currentTimeMs,
      activeMarkIndex: findActiveMarkIndex(timeline.marks, currentTimeMs),
      activeChapterIndex: this.chapterIndexAt(currentTimeMs),
      error: null,
    };
    return this.emit();
  }

  pause(): ReaderEngineState {
    this.requireTimeline();
    this.state = { ...this.state, status: "paused" };
    return this.emit();
  }

  toggle(): ReaderEngineState {
    return this.state.status === "playing" ? this.pause() : this.play();
  }

  tick(elapsedMs: number): ReaderEngineState {
    if (this.timeline === null || this.state.status !== "playing" || elapsedMs <= 0) {
      return this.state;
    }
    return this.seek(this.state.currentTimeMs + elapsedMs * this.state.playbackRate, true);
  }

  seek(timeMs: number, keepPlaying = false): ReaderEngineState {
    const timeline = this.requireTimeline();
    const currentTimeMs = clampTime(timeMs, timeline.durationMs);
    const ended = currentTimeMs >= timeline.durationMs;
    this.state = {
      ...this.state,
      status: ended ? "ended" : keepPlaying ? "playing" : "paused",
      currentTimeMs,
      activeMarkIndex: findActiveMarkIndex(timeline.marks, currentTimeMs),
      activeChapterIndex: this.chapterIndexAt(currentTimeMs),
      error: null,
    };
    return this.emit();
  }

  skip(deltaMs: number): ReaderEngineState {
    return this.seek(this.state.currentTimeMs + deltaMs);
  }

  repeatActiveWord(): ReaderEngineState {
    const mark = this.getActiveMark();
    if (mark === null) {
      return this.state;
    }
    return this.seek(mark.startMs, true);
  }

  setPlaybackRate(rate: number): ReaderEngineState {
    if (!Number.isFinite(rate) || rate < 0.5 || rate > 2) {
      throw new Error("reader.playback.invalid_rate");
    }
    this.state = { ...this.state, playbackRate: rate };
    return this.emit();
  }

  changeChapter(direction: -1 | 1): ReaderEngineState {
    const timeline = this.requireTimeline();
    const nextIndex = Math.min(
      Math.max(this.state.activeChapterIndex + direction, 0),
      Math.max(timeline.chapters.length - 1, 0),
    );
    return this.seek(chapterStartTime(timeline, nextIndex));
  }

  handleViewportChange(): ReaderEngineState {
    this.state = { ...this.state, layoutRevision: this.state.layoutRevision + 1 };
    return this.emit();
  }

  handleInterruption(): ReaderEngineState {
    return this.state.status === "playing" ? this.pause() : this.state;
  }

  handleAudioLoss(message = "reader.audio.unavailable"): ReaderEngineState {
    this.state = { ...this.state, status: "error", error: message };
    return this.emit();
  }

  getProgress(): ReaderProgress {
    const mark = this.getActiveMark();
    const chapter = this.timeline?.chapters[this.state.activeChapterIndex];
    return {
      positionMs: Math.round(this.state.currentTimeMs),
      stableAnchor: mark?.paragraphKey ?? null,
      chapterKey: chapter?.stableKey ?? null,
    };
  }

  private chapterIndexAt(timeMs: number): number {
    const timeline = this.timeline;
    if (timeline === null || timeline.chapters.length === 0) {
      return 0;
    }
    let active = 0;
    timeline.chapters.forEach((_chapter, index) => {
      if (chapterStartTime(timeline, index) <= timeMs) {
        active = index;
      }
    });
    return active;
  }

  private requireTimeline(): ReaderTimeline {
    if (this.timeline === null) {
      throw new Error("reader.timeline.not_loaded");
    }
    return this.timeline;
  }

  private emit(): ReaderEngineState {
    this.listeners.forEach((listener) => {
      listener(this.state);
    });
    return this.state;
  }
}
