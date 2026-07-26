import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_READER_PREFERENCES,
  createVocabularyEntry,
  preferencesForMode,
  readFavorites,
  readHistory,
  readLearningHistory,
  readPreferences,
  readVocabulary,
  recordLearningHistory,
  removeHistory,
  reviewVocabulary,
  saveHistory,
  toggleFavorite,
  toggleVocabulary,
  updateVocabulary,
  writePreferences,
} from "./readerStorage.js";

describe("reader local storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("recovers safe defaults from missing, corrupt and partial preferences", () => {
    expect(readPreferences(window.localStorage)).toEqual(DEFAULT_READER_PREFERENCES);
    window.localStorage.setItem("followread-reader-preferences-v1", "{broken");
    expect(readPreferences(window.localStorage)).toEqual(DEFAULT_READER_PREFERENCES);
    window.localStorage.setItem(
      "followread-reader-preferences-v1",
      JSON.stringify({
        mode: "adult",
        theme: "dark",
        fontScale: 9,
        showPointer: false,
        defaultLanguage: "en",
        playbackRate: 0.1,
      }),
    );
    expect(readPreferences(window.localStorage)).toMatchObject({
      mode: "adult",
      theme: "dark",
      fontScale: 1.5,
      showPointer: false,
      defaultLanguage: "en",
      playbackRate: 0.5,
    });
  });

  it("writes preferences and applies every mode preset", () => {
    const adult = preferencesForMode("adult", DEFAULT_READER_PREFERENCES);
    const learning = preferencesForMode("learning", adult);
    const children = preferencesForMode("children", learning);
    expect(adult).toMatchObject({ mode: "adult", showPointer: false, fontScale: 1 });
    expect(learning).toMatchObject({
      mode: "learning",
      defaultLanguage: "en",
      playbackRate: 0.75,
    });
    expect(children).toMatchObject({ mode: "children", defaultLanguage: "es", fontScale: 1.2 });
    writePreferences(window.localStorage, learning);
    expect(readPreferences(window.localStorage)).toEqual(learning);
  });

  it("deduplicates and toggles favorites", () => {
    window.localStorage.setItem(
      "followread-reader-favorites-v1",
      JSON.stringify(["cuento", "cuento", "", 3]),
    );
    expect(readFavorites(window.localStorage)).toEqual(["cuento"]);
    expect(toggleFavorite(window.localStorage, "cuento")).toBe(false);
    expect(toggleFavorite(window.localStorage, "otro")).toBe(true);
    expect(readFavorites(window.localStorage)).toEqual(["otro"]);
  });

  it("validates, sorts, limits and removes history", () => {
    const base = {
      slug: "cuento",
      title: "Cuento",
      coverUri: null,
      language: "es" as const,
      positionMs: 100,
      durationMs: 1000,
      chapterTitle: null,
      updatedAt: "2026-01-01T00:00:00Z",
    };
    window.localStorage.setItem("followread-reader-history-v1", JSON.stringify([{}, base]));
    expect(readHistory(window.localStorage)).toEqual([base]);
    for (let index = 0; index < 55; index += 1) {
      saveHistory(window.localStorage, {
        ...base,
        slug: `cuento-${String(index)}`,
        updatedAt: `2026-02-${String((index % 27) + 1).padStart(2, "0")}T00:00:00Z`,
      });
    }
    expect(readHistory(window.localStorage)).toHaveLength(50);
    removeHistory(window.localStorage, "cuento-54");
    expect(readHistory(window.localStorage).some((entry) => entry.slug === "cuento-54")).toBe(
      false,
    );
  });

  it("creates, validates and toggles vocabulary entries", () => {
    const entry = createVocabularyEntry({
      slug: "cuento",
      word: "Moon",
      translation: "Luna",
      language: "en",
    });
    expect(entry.id).toBe("cuento:en:moon");
    expect(entry).toMatchObject({ status: "new", favorite: false, reviewCount: 0 });
    expect(Number.isNaN(Date.parse(entry.savedAt))).toBe(false);
    expect(toggleVocabulary(window.localStorage, entry)).toBe(true);
    expect(readVocabulary(window.localStorage)).toEqual([entry]);
    expect(toggleVocabulary(window.localStorage, entry)).toBe(false);
    window.localStorage.setItem("followread-reader-vocabulary-v1", JSON.stringify([{}, entry]));
    expect(readVocabulary(window.localStorage)).toEqual([entry]);
  });

  it("tracks word exploration, favorites and study reviews", () => {
    const entry = createVocabularyEntry({
      slug: "cuento",
      word: "Moon",
      translation: "Luna",
      language: "en",
      meaning: "La luna del cuento.",
      sourceExample: "The moon shines.",
      translatedExample: "La luna brilla.",
    });
    toggleVocabulary(window.localStorage, entry);
    updateVocabulary(window.localStorage, entry.id, { favorite: true, status: "learning" });
    const reviewed = reviewVocabulary(window.localStorage, entry.id);
    expect(reviewed).toMatchObject({ favorite: true, status: "learning", reviewCount: 1 });

    recordLearningHistory(window.localStorage, {
      id: entry.id,
      slug: entry.slug,
      word: entry.word,
      translation: entry.translation,
      language: entry.language,
    });
    recordLearningHistory(window.localStorage, {
      id: entry.id,
      slug: entry.slug,
      word: entry.word,
      translation: entry.translation,
      language: entry.language,
    });
    expect(readLearningHistory(window.localStorage)[0]).toMatchObject({
      id: entry.id,
      visits: 2,
    });
  });
});
