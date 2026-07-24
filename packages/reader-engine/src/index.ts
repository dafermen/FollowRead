export interface ReaderEngineClock {
  readonly currentTimeMs: number;
  readonly durationMs: number;
}

export const clampTime = (timeMs: number, durationMs: number): number =>
  Math.min(Math.max(timeMs, 0), Math.max(durationMs, 0));
