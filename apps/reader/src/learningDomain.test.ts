import { describe, expect, it } from "vitest";

import {
  buildLearningInsight,
  matchesVocabularyFilter,
  summarizeLearningProgress,
} from "./learningDomain.js";
import type { ReaderPackage } from "./readerClient.js";
import { createVocabularyEntry, type LearningHistoryEntry } from "./readerStorage.js";

const story: ReaderPackage = {
  content_id: "story-id",
  slug: "story",
  version: 1,
  cover_uri: null,
  cover_alt_text: null,
  translations: [
    {
      language: "en",
      title: "Moon",
      summary: null,
      chapters: [
        {
          stable_key: "chapter",
          title: "Night",
          paragraphs: [{ stable_key: "paragraph", text: "The fox watches the moon." }],
        },
      ],
      audio: {
        uri: "en.mp3",
        duration_ms: 1000,
        voice_id: "Joanna",
        simulated: true,
        marks: ["The", "fox", "watches", "the", "moon"].map((value, index) => ({
          value,
          start_ms: index * 100,
          end_ms: index * 100 + 100,
          char_start: index * 5,
          char_end: index * 5 + value.length,
          paragraph_key: "paragraph",
          chapter_key: "chapter",
        })),
      },
    },
    {
      language: "es",
      title: "Luna",
      summary: null,
      chapters: [
        {
          stable_key: "chapter",
          title: "Noche",
          paragraphs: [{ stable_key: "paragraph", text: "El zorro mira la luna." }],
        },
      ],
      audio: {
        uri: "es.mp3",
        duration_ms: 1000,
        voice_id: "Lucia",
        simulated: true,
        marks: ["El", "zorro", "mira", "la", "luna"].map((value, index) => ({
          value,
          start_ms: index * 100,
          end_ms: index * 100 + 100,
          char_start: index * 5,
          char_end: index * 5 + value.length,
          paragraph_key: "paragraph",
          chapter_key: "chapter",
        })),
      },
    },
  ],
};

describe("learning domain", () => {
  it("builds contextual insight from aligned editorial paragraphs", () => {
    const english = story.translations.find((translation) => translation.language === "en");
    const watched = english?.audio.marks.find((mark) => mark.value === "watches");
    if (english === undefined || watched === undefined) {
      throw new Error("The bilingual fixture is incomplete.");
    }
    const insight = buildLearningInsight(story, english, watched);

    expect(insight).toMatchObject({
      id: "story:en:watches",
      word: "watches",
      translation: "mira",
      sourceExample: "The fox watches the moon.",
      translatedExample: "El zorro mira la luna.",
    });
    expect(insight.meaning).toContain("mira");
  });

  it("summarizes exploration, saved words and study states", () => {
    const first = createVocabularyEntry({
      slug: "story",
      word: "moon",
      translation: "luna",
      language: "en",
    });
    const second = {
      ...first,
      id: "story:en:fox",
      word: "fox",
      favorite: true,
      status: "mastered" as const,
    };
    const history: LearningHistoryEntry[] = [
      {
        id: first.id,
        slug: "story",
        word: first.word,
        translation: first.translation,
        language: "en",
        visits: 2,
        viewedAt: "2026-07-26T00:00:00Z",
      },
    ];

    expect(summarizeLearningProgress([first, second], history)).toMatchObject({
      explored: 1,
      saved: 2,
      mastered: 1,
      favorites: 1,
      goalPercentage: 20,
    });
    expect(matchesVocabularyFilter(second, "favorites")).toBe(true);
    expect(matchesVocabularyFilter(first, "learning")).toBe(false);
  });
});
