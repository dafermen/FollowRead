# Project scope

**Status:** Approved for Phase 0  
**Responsible task:** FR-PH00-TASK-004 - COMPLETED  
**Date:** 2026-07-24

## Overall scope

FollowRead comprises Web Admin, Web/PWA/mobile Reader, API, Reader Engine, audio processing,
versioned content, offline, progress, favorites, vocabulary, accessibility, security, testing and
operation. The full roadmap is executed in phases; not everything belongs to the MVP.

## MVP: vertical web cut

The MVP is a complete web/PWA demonstration of the main flow. It must validate synchronization,
publication and offline before expanding types, platforms or personal data.

### Admin MVP

- editorial user authentication;
- creation of a bilingual `story` with chapters and paragraphs;
- audience, level, category, cover and voices;
- draft/autosave and validations;
- processing, review, approval and publication;
- history, error and essential retry.

### API MVP

- identity, permissions and auditing needed for Admin;
- content, translations, versions and states;
- compatible public catalog;
- basic progress, favorites and vocabulary;
- Polly/S3 adapters with fakes in automation;
- health checks and OpenAPI.

### Reader MVP

- responsive web and PWA; no mobile binaries;
- included catalog plus remote catalog;
- library, detail and reader for demonstration content;
- playback, active word, highlighting, optional SVG hand and auto-scroll;
- pause, resume, rewind, repeat and speed;
- child, adult, Spanish, English and learn-English as settings;
- local and synchronizable progress;
- downloadable package with checksum and recovery;
- keyboard, semantics, contrast and reduced motion.

### Content MVP

- one main bilingual story and small fixtures;
- translations and vocabulary created editorially;
- documentation of text, translation, image and audio rights;
- `story` implemented first; other types remain in the product contract.

### Acceptance demonstration

```text
create -> process -> review -> publish -> discover -> download
-> synchronized playback -> save progress -> continue offline
```

## After the MVP, within the roadmap

- Android and iOS applications;
- books, articles and lessons with specific experiences;
- free notes and advanced bookmarks;
- educational analytics compatible with privacy;
- more languages;
- distributed processing with Redis/Celery or equivalent;
- password recovery and advanced administration;
- scale and cost optimizations.

## Out of MVP, but architecture-compatible

- child personal accounts and guardian portal;
- machine translation or external dictionary;
- monetization;
- free notes;
- Android and iOS;
- distributed processing.

## Out of scope unless new decision

- social network, chat or public comments;
- live streaming;
- complex DRM;
- medical diagnosis, therapy or certified academic assessment;
- AI as a dependency of an essential feature;
- direct frontend calls to AWS;
- an independent `document` type without differentiating behavior.

## Limits by component

| Component | Does | Does not |
|---|---|---|
| Admin | Edit, process, review and publish | Not packaged into mobile nor call AWS |
| Reader | Discover, download and play | Does not edit or publish |
| API | Authorize, validate and coordinate | Does not present UI nor expose secrets |
| Reader Engine | Resolve playback and timing | Does not depend on React, DOM, AWS or network |
| Shared packages | Contracts and reusable pieces | Do not mix app-specific rules |

## Constraints

- main technologies fixed by the prompt;
- content updated without rebuild;
- Admin is never packaged with Reader;
- AWS tests with mocks or fake adapters;
- secrets kept out of the repository;
- reasonable support for modern browsers, Android and iOS;
- architecture prepared for future asynchronous processing.

## Assumptions

- there is one person responsible for content and another capable of approving it;
- content has rights for reproduction, translation, images and audio;
- the backend is available when downloading or syncing, not when reading local material;
- timing belongs to the exact version of the text;
- local profiles allow testing the Reader without requiring an account.

## External dependencies

- Amazon Polly;
- Amazon S3;
- SQLite included in Python for the MVP;
- PostgreSQL only as a future evolution when scale, concurrency or deployment require it;
- Apple and Google stores in Phase 10+;
- hosting and observability provider to be defined.

## Scope decisions

- `document` is represented as `article` until there is a differentiating case.
- The MVP does not create child personal accounts.
- Essential translations and meanings are editorial.
- Favorites and position are in the MVP; free notes remain later.
- SQLite is the authoritative base of the MVP and removes the dependency on Docker/PostgreSQL.

## Validation

- MVP, roadmap and out-of-scope are separated: PASS.
- Admin, Reader, API and Reader Engine have boundaries: PASS.
- Initial content types are resolved: PASS.
- Constraints, assumptions and dependencies are explicit: PASS.
