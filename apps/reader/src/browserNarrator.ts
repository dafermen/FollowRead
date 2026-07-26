import type { ReaderMark, ReaderTranslation } from "./readerClient.js";

/**
 * Minimal boundary event used by the Web Speech adapter.
 * Keeping this type small makes narration testable without a real browser voice.
 */
export type NarrationBoundaryEvent = { charIndex: number };

export type NarrationCallbacks = {
  onBoundary: (mark: ReaderMark) => void;
  onEnd: () => void;
  onError: () => void;
};

type NarrationUtterance = {
  lang: string;
  rate: number;
  onboundary: ((event: NarrationBoundaryEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechSynthesisPort = {
  readonly paused: boolean;
  readonly speaking: boolean;
  speak: (utterance: NarrationUtterance) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
};

type UtteranceFactory = (text: string) => NarrationUtterance;

/**
 * Browser-owned narration boundary.
 *
 * The published demo audio only contains deterministic timing data. This adapter optionally asks
 * the operating system/browser to speak the same editorial text and uses word boundary events to
 * correct the Reader Engine position. It never sends text to an external API.
 */
export class BrowserNarrator {
  constructor(
    private readonly synthesis: SpeechSynthesisPort | null,
    private readonly createUtterance: UtteranceFactory | null,
  ) {}

  get available(): boolean {
    return this.synthesis !== null && this.createUtterance !== null;
  }

  get paused(): boolean {
    return this.synthesis?.paused ?? false;
  }

  start(
    translation: ReaderTranslation,
    startCharacter: number,
    rate: number,
    callbacks: NarrationCallbacks,
  ): boolean {
    if (this.synthesis === null || this.createUtterance === null) {
      return false;
    }
    const text = narrationText(translation);
    const safeStart = Math.min(Math.max(startCharacter, 0), text.length);
    const utterance = this.createUtterance(text.slice(safeStart));
    utterance.lang = translation.language === "es" ? "es-ES" : "en-US";
    utterance.rate = rate;
    utterance.onboundary = (event) => {
      const mark = markAtCharacter(translation.audio.marks, event.charIndex + safeStart);
      if (mark !== null) {
        callbacks.onBoundary(mark);
      }
    };
    utterance.onend = callbacks.onEnd;
    utterance.onerror = callbacks.onError;
    this.synthesis.cancel();
    this.synthesis.speak(utterance);
    return true;
  }

  pause(): void {
    if (this.synthesis?.speaking === true) {
      this.synthesis.pause();
    }
  }

  resume(): boolean {
    if (this.synthesis?.paused !== true) {
      return false;
    }
    this.synthesis.resume();
    return true;
  }

  stop(): void {
    this.synthesis?.cancel();
  }
}

export const narrationText = (translation: ReaderTranslation): string =>
  translation.chapters
    .flatMap((chapter) => chapter.paragraphs.map((paragraph) => paragraph.text.trim()))
    .filter((paragraph) => paragraph !== "")
    .join("\n\n");

export const markAtCharacter = (
  marks: readonly ReaderMark[],
  characterIndex: number,
): ReaderMark | null =>
  marks.find((mark) => mark.char_start <= characterIndex && characterIndex < mark.char_end) ?? null;

/**
 * Creates the real browser adapter. Unsupported or privacy-restricted browsers receive a safe
 * unavailable adapter and the Reader continues with its deterministic visual timeline.
 */
export const createBrowserNarrator = (): BrowserNarrator => {
  if (
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window) ||
    typeof SpeechSynthesisUtterance !== "function"
  ) {
    return new BrowserNarrator(null, null);
  }
  return new BrowserNarrator(
    window.speechSynthesis as unknown as SpeechSynthesisPort,
    (text) => new SpeechSynthesisUtterance(text) as unknown as NarrationUtterance,
  );
};
