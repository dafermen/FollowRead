/**
 * Local, non-sensitive Reader data.
 *
 * Why this module exists:
 * Phase 8 needs favorites, history, vocabulary and preferences before personal accounts are
 * introduced. Keeping their keys and validation in one module prevents screens from inventing
 * incompatible formats. Only reading choices are stored; names, emails and child identifiers are
 * deliberately excluded.
 */

export type ReadingMode = "children" | "adult" | "learning";
export type ReaderTheme = "system" | "light" | "dark";
export type ReaderLanguage = "es" | "en";

export type ReaderPreferences = {
  mode: ReadingMode;
  theme: ReaderTheme;
  fontScale: number;
  showPointer: boolean;
  autoScroll: boolean;
  reduceMotion: boolean;
  narrationEnabled: boolean;
  defaultLanguage: ReaderLanguage;
  playbackRate: number;
  showTranslation: boolean;
};

export type ReadingHistoryEntry = {
  slug: string;
  title: string;
  coverUri: string | null;
  language: ReaderLanguage;
  positionMs: number;
  durationMs: number;
  chapterTitle: string | null;
  updatedAt: string;
};

export type VocabularyEntry = {
  id: string;
  slug: string;
  word: string;
  translation: string;
  language: ReaderLanguage;
  savedAt: string;
  meaning: string;
  sourceExample: string;
  translatedExample: string;
  favorite: boolean;
  status: VocabularyStatus;
  reviewCount: number;
  lastReviewedAt: string | null;
};

export type VocabularyStatus = "new" | "learning" | "mastered";

export type LearningHistoryEntry = {
  id: string;
  slug: string;
  word: string;
  translation: string;
  language: ReaderLanguage;
  visits: number;
  viewedAt: string;
};

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "getItem" | "setItem">;

const FAVORITES_KEY = "followread-reader-favorites-v1";
const HISTORY_KEY = "followread-reader-history-v1";
const VOCABULARY_KEY = "followread-reader-vocabulary-v1";
const LEARNING_HISTORY_KEY = "followread-reader-learning-history-v1";
const PREFERENCES_KEY = "followread-reader-preferences-v1";

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  mode: "children",
  theme: "system",
  fontScale: 1.1,
  showPointer: true,
  autoScroll: true,
  reduceMotion: false,
  narrationEnabled: true,
  defaultLanguage: "es",
  playbackRate: 1,
  showTranslation: false,
};

/**
 * Returns safe preferences even when an older browser value is incomplete or corrupt.
 */
export const readPreferences = (storage: StorageReader): ReaderPreferences => {
  const value = readUnknown(storage, PREFERENCES_KEY);
  if (!isRecord(value)) {
    return DEFAULT_READER_PREFERENCES;
  }
  return {
    mode: isReadingMode(value["mode"]) ? value["mode"] : DEFAULT_READER_PREFERENCES.mode,
    theme: isReaderTheme(value["theme"]) ? value["theme"] : DEFAULT_READER_PREFERENCES.theme,
    fontScale: clampNumber(value["fontScale"], 0.85, 1.5, DEFAULT_READER_PREFERENCES.fontScale),
    showPointer: readBoolean(value["showPointer"], DEFAULT_READER_PREFERENCES.showPointer),
    autoScroll: readBoolean(value["autoScroll"], DEFAULT_READER_PREFERENCES.autoScroll),
    reduceMotion: readBoolean(value["reduceMotion"], DEFAULT_READER_PREFERENCES.reduceMotion),
    narrationEnabled: readBoolean(
      value["narrationEnabled"],
      DEFAULT_READER_PREFERENCES.narrationEnabled,
    ),
    defaultLanguage: isReaderLanguage(value["defaultLanguage"])
      ? value["defaultLanguage"]
      : DEFAULT_READER_PREFERENCES.defaultLanguage,
    playbackRate: clampNumber(
      value["playbackRate"],
      0.5,
      2,
      DEFAULT_READER_PREFERENCES.playbackRate,
    ),
    showTranslation: readBoolean(
      value["showTranslation"],
      DEFAULT_READER_PREFERENCES.showTranslation,
    ),
  };
};

export const writePreferences = (storage: StorageWriter, preferences: ReaderPreferences): void => {
  storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
};

/**
 * Applies useful mode defaults while preserving choices that are independent of the mode.
 */
export const preferencesForMode = (
  mode: ReadingMode,
  current: ReaderPreferences,
): ReaderPreferences => {
  if (mode === "children") {
    return {
      ...current,
      mode,
      fontScale: 1.2,
      showPointer: true,
      defaultLanguage: "es",
      playbackRate: 1,
      showTranslation: false,
    };
  }
  if (mode === "learning") {
    return {
      ...current,
      mode,
      fontScale: 1.1,
      showPointer: true,
      defaultLanguage: "en",
      playbackRate: 0.75,
      showTranslation: false,
    };
  }
  return {
    ...current,
    mode,
    fontScale: 1,
    showPointer: false,
    defaultLanguage: "es",
    playbackRate: 1,
    showTranslation: false,
  };
};

export const readFavorites = (storage: StorageReader): string[] => {
  const value = readUnknown(storage, FAVORITES_KEY);
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string" && item !== ""))]
    : [];
};

export const toggleFavorite = (storage: StorageWriter, slug: string): boolean => {
  const favorites = readFavorites(storage);
  const isFavorite = favorites.includes(slug);
  const next = isFavorite ? favorites.filter((item) => item !== slug) : [...favorites, slug];
  storage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return !isFavorite;
};

export const readHistory = (storage: StorageReader): ReadingHistoryEntry[] => {
  const value = readUnknown(storage, HISTORY_KEY);
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(isHistoryEntry)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const saveHistory = (storage: StorageWriter, entry: ReadingHistoryEntry): void => {
  const withoutCurrent = readHistory(storage).filter((item) => item.slug !== entry.slug);
  storage.setItem(HISTORY_KEY, JSON.stringify([entry, ...withoutCurrent].slice(0, 50)));
};

export const removeHistory = (storage: StorageWriter, slug: string): void => {
  storage.setItem(
    HISTORY_KEY,
    JSON.stringify(readHistory(storage).filter((item) => item.slug !== slug)),
  );
};

export const readVocabulary = (storage: StorageReader): VocabularyEntry[] => {
  const value = readUnknown(storage, VOCABULARY_KEY);
  return Array.isArray(value)
    ? value
        .filter(isVocabularyEntry)
        .map(normalizeVocabularyEntry)
        .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
    : [];
};

export const toggleVocabulary = (storage: StorageWriter, entry: VocabularyEntry): boolean => {
  const vocabulary = readVocabulary(storage);
  const exists = vocabulary.some((item) => item.id === entry.id);
  const next = exists ? vocabulary.filter((item) => item.id !== entry.id) : [entry, ...vocabulary];
  storage.setItem(VOCABULARY_KEY, JSON.stringify(next));
  return !exists;
};

export const updateVocabulary = (
  storage: StorageWriter,
  id: string,
  updates: Partial<Pick<VocabularyEntry, "favorite" | "status" | "reviewCount" | "lastReviewedAt">>,
): VocabularyEntry | null => {
  const vocabulary = readVocabulary(storage);
  const current = vocabulary.find((entry) => entry.id === id);
  if (current === undefined) {
    return null;
  }
  const updated = { ...current, ...updates };
  storage.setItem(
    VOCABULARY_KEY,
    JSON.stringify(vocabulary.map((entry) => (entry.id === id ? updated : entry))),
  );
  return updated;
};

export const reviewVocabulary = (storage: StorageWriter, id: string): VocabularyEntry | null => {
  const current = readVocabulary(storage).find((entry) => entry.id === id);
  if (current === undefined) {
    return null;
  }
  return updateVocabulary(storage, id, {
    status: current.status === "new" ? "learning" : current.status,
    reviewCount: current.reviewCount + 1,
    lastReviewedAt: new Date().toISOString(),
  });
};

export const readLearningHistory = (storage: StorageReader): LearningHistoryEntry[] => {
  const value = readUnknown(storage, LEARNING_HISTORY_KEY);
  return Array.isArray(value)
    ? value
        .filter(isLearningHistoryEntry)
        .sort((left, right) => right.viewedAt.localeCompare(left.viewedAt))
    : [];
};

export const recordLearningHistory = (
  storage: StorageWriter,
  entry: Omit<LearningHistoryEntry, "visits" | "viewedAt">,
): LearningHistoryEntry => {
  const history = readLearningHistory(storage);
  const existing = history.find((item) => item.id === entry.id);
  const updated = {
    ...entry,
    visits: (existing?.visits ?? 0) + 1,
    viewedAt: new Date().toISOString(),
  };
  storage.setItem(
    LEARNING_HISTORY_KEY,
    JSON.stringify([updated, ...history.filter((item) => item.id !== entry.id)].slice(0, 100)),
  );
  return updated;
};

export const clearLearningHistory = (storage: StorageWriter): void => {
  storage.setItem(LEARNING_HISTORY_KEY, "[]");
};

export const vocabularyId = (slug: string, language: ReaderLanguage, word: string): string =>
  `${slug}:${language}:${word.toLocaleLowerCase()}`;

/**
 * Creates the complete local record used by the learning panel and vocabulary screen.
 */
export const createVocabularyEntry = ({
  slug,
  word,
  translation,
  language,
  meaning = "",
  sourceExample = "",
  translatedExample = "",
}: {
  slug: string;
  word: string;
  translation: string;
  language: ReaderLanguage;
  meaning?: string;
  sourceExample?: string;
  translatedExample?: string;
}): VocabularyEntry => ({
  id: vocabularyId(slug, language, word),
  slug,
  word,
  translation,
  language,
  savedAt: new Date().toISOString(),
  meaning,
  sourceExample,
  translatedExample,
  favorite: false,
  status: "new",
  reviewCount: 0,
  lastReviewedAt: null,
});

const readUnknown = (storage: StorageReader, key: string): unknown => {
  const raw = storage.getItem(key);
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isReadingMode = (value: unknown): value is ReadingMode =>
  value === "children" || value === "adult" || value === "learning";

const isReaderTheme = (value: unknown): value is ReaderTheme =>
  value === "system" || value === "light" || value === "dark";

const isReaderLanguage = (value: unknown): value is ReaderLanguage =>
  value === "es" || value === "en";

const readBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const clampNumber = (value: unknown, minimum: number, maximum: number, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(value, minimum), maximum)
    : fallback;

const isHistoryEntry = (value: unknown): value is ReadingHistoryEntry =>
  isRecord(value) &&
  typeof value["slug"] === "string" &&
  typeof value["title"] === "string" &&
  (typeof value["coverUri"] === "string" || value["coverUri"] === null) &&
  isReaderLanguage(value["language"]) &&
  typeof value["positionMs"] === "number" &&
  typeof value["durationMs"] === "number" &&
  (typeof value["chapterTitle"] === "string" || value["chapterTitle"] === null) &&
  typeof value["updatedAt"] === "string";

const isVocabularyEntry = (value: unknown): value is VocabularyEntry =>
  isRecord(value) &&
  typeof value["id"] === "string" &&
  typeof value["slug"] === "string" &&
  typeof value["word"] === "string" &&
  typeof value["translation"] === "string" &&
  isReaderLanguage(value["language"]) &&
  typeof value["savedAt"] === "string";

const normalizeVocabularyEntry = (entry: VocabularyEntry): VocabularyEntry => ({
  ...entry,
  meaning: typeof entry.meaning === "string" ? entry.meaning : "",
  sourceExample: typeof entry.sourceExample === "string" ? entry.sourceExample : "",
  translatedExample: typeof entry.translatedExample === "string" ? entry.translatedExample : "",
  favorite: typeof entry.favorite === "boolean" ? entry.favorite : false,
  status: isVocabularyStatus(entry.status) ? entry.status : "new",
  reviewCount:
    typeof entry.reviewCount === "number" && Number.isFinite(entry.reviewCount)
      ? Math.max(0, entry.reviewCount)
      : 0,
  lastReviewedAt: typeof entry.lastReviewedAt === "string" ? entry.lastReviewedAt : null,
});

const isVocabularyStatus = (value: unknown): value is VocabularyStatus =>
  value === "new" || value === "learning" || value === "mastered";

const isLearningHistoryEntry = (value: unknown): value is LearningHistoryEntry =>
  isRecord(value) &&
  typeof value["id"] === "string" &&
  typeof value["slug"] === "string" &&
  typeof value["word"] === "string" &&
  typeof value["translation"] === "string" &&
  isReaderLanguage(value["language"]) &&
  typeof value["visits"] === "number" &&
  typeof value["viewedAt"] === "string";
