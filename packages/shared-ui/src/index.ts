export type ColorScheme = "light" | "dark" | "system";

export type ReaderMode = "children" | "adult" | "learning";

export interface AccessibleControlState {
  readonly disabled: boolean;
  readonly busy: boolean;
}
