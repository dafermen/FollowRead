import type { ReaderPreferences } from "./readerStorage.js";

export const modeLabel = (mode: ReaderPreferences["mode"]) => {
  if (mode === "children") {
    return "Modo infantil";
  }
  if (mode === "learning") {
    return "Aprender inglés";
  }
  return "Modo adulto";
};
