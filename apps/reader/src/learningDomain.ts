import type { ReaderMark, ReaderPackage, ReaderTranslation } from "./readerClient.js";
import type { LearningHistoryEntry, ReaderLanguage, VocabularyEntry } from "./readerStorage.js";

export type LearningInsight = {
  id: string;
  slug: string;
  word: string;
  translation: string;
  meaning: string;
  language: ReaderLanguage;
  paragraphKey: string;
  sourceExample: string;
  translatedExample: string;
};

export type LearningProgress = {
  explored: number;
  saved: number;
  learning: number;
  mastered: number;
  favorites: number;
  goal: number;
  goalPercentage: number;
};

/**
 * Builds a contextual learning card exclusively from the bilingual editorial package.
 *
 * Stable paragraph keys provide the canonical context. The word equivalent uses relative word
 * position as a deterministic fallback because the MVP package does not yet carry a dictionary or
 * AI-generated alignment.
 */
export const buildLearningInsight = (
  story: ReaderPackage,
  source: ReaderTranslation,
  mark: ReaderMark,
): LearningInsight => {
  const targetLanguage: ReaderLanguage = source.language === "en" ? "es" : "en";
  const target = story.translations.find((translation) => translation.language === targetLanguage);
  const sourceParagraph = findParagraph(source, mark.paragraph_key);
  const targetParagraph =
    target === undefined ? undefined : findParagraph(target, mark.paragraph_key);
  const sourceMarks = marksForParagraph(source, mark.paragraph_key);
  const targetMarks = target === undefined ? [] : marksForParagraph(target, mark.paragraph_key);
  const sourceIndex = Math.max(
    0,
    sourceMarks.findIndex(
      (candidate) =>
        candidate.char_start === mark.char_start && candidate.char_end === mark.char_end,
    ),
  );
  const targetIndex =
    sourceMarks.length <= 1
      ? 0
      : Math.round((sourceIndex / (sourceMarks.length - 1)) * Math.max(targetMarks.length - 1, 0));
  const translatedWord = cleanWord(targetMarks[targetIndex]?.value ?? "");
  const translation = translatedWord === "" ? "Traducción no disponible" : translatedWord;
  const cleanSourceWord = cleanWord(mark.value);

  return {
    id: `${story.slug}:${source.language}:${normalizeWord(cleanSourceWord)}`,
    slug: story.slug,
    word: cleanSourceWord,
    translation,
    meaning:
      translatedWord === ""
        ? "Este cuento no incluye un equivalente editorial para esta palabra."
        : `En este cuento, “${cleanSourceWord}” expresa “${translatedWord}”.`,
    language: source.language,
    paragraphKey: mark.paragraph_key,
    sourceExample: sourceParagraph?.text ?? cleanSourceWord,
    translatedExample:
      targetParagraph?.text ?? "El ejemplo traducido no está disponible en este paquete.",
  };
};

export const summarizeLearningProgress = (
  vocabulary: VocabularyEntry[],
  history: LearningHistoryEntry[],
  goal = 5,
): LearningProgress => {
  const explored = new Set(history.map((entry) => entry.id)).size;
  const mastered = vocabulary.filter((entry) => entry.status === "mastered").length;
  const learning = vocabulary.filter((entry) => entry.status === "learning").length;
  return {
    explored,
    saved: vocabulary.length,
    learning,
    mastered,
    favorites: vocabulary.filter((entry) => entry.favorite).length,
    goal,
    goalPercentage: Math.min(100, Math.round((explored / goal) * 100)),
  };
};

export const matchesVocabularyFilter = (
  entry: VocabularyEntry,
  filter: "all" | "new" | "learning" | "mastered" | "favorites",
): boolean => {
  if (filter === "all") {
    return true;
  }
  if (filter === "favorites") {
    return entry.favorite;
  }
  return entry.status === filter;
};

/**
 * Returns the exact sentence around a selected mark.
 *
 * Published speech marks retain terminal punctuation in their values. This lets the Reader find a
 * sentence boundary without duplicating audio timing or assuming that one paragraph is one
 * sentence.
 */
export const sentenceMarksFor = (
  translation: ReaderTranslation,
  selected: ReaderMark,
): ReaderMark[] => {
  const paragraphMarks = marksForParagraph(translation, selected.paragraph_key);
  const selectedIndex = paragraphMarks.findIndex(
    (mark) => mark.char_start === selected.char_start && mark.char_end === selected.char_end,
  );
  if (selectedIndex < 0) {
    return [];
  }
  let start = selectedIndex;
  while (start > 0 && !endsSentence(paragraphMarks[start - 1]?.value ?? "")) {
    start -= 1;
  }
  let end = selectedIndex;
  while (end < paragraphMarks.length - 1 && !endsSentence(paragraphMarks[end]?.value ?? "")) {
    end += 1;
  }
  return paragraphMarks.slice(start, end + 1);
};

const findParagraph = (translation: ReaderTranslation, stableKey: string) =>
  translation.chapters
    .flatMap((chapter) => chapter.paragraphs)
    .find((paragraph) => paragraph.stable_key === stableKey);

const marksForParagraph = (translation: ReaderTranslation, stableKey: string) =>
  translation.audio.marks.filter((mark) => mark.paragraph_key === stableKey);

const cleanWord = (word: string): string =>
  word
    .trim()
    .replace(/^[^\p{L}\p{N}'’-]+/u, "")
    .replace(/[^\p{L}\p{N}'’-]+$/u, "");

const normalizeWord = (word: string): string =>
  cleanWord(word).normalize("NFKC").toLocaleLowerCase();

const endsSentence = (word: string): boolean => /[.!?][”"')\]]*$/u.test(word.trim());
