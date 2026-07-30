# FollowRead Project Status

**Last updated:** 2026-07-30
**Active phase:** Phase 13 - CI/CD and deployment
**Phase status:** IN_PROGRESS - READY_FOR_EXTERNAL_VALIDATION
**Active task:** FR-PH13-TASK-012 - Docker, GitHub and staging validation
**Task status:** BLOCKED

## Executive summary

Phases 0 through 12 are completed and audited. Reader is already a web/PWA/Android/iOS application with
discovery, preferences, local voice, verified downloads, offline reading,
synchronization, Capacitor projects and a complete learn-English mode. Quality, security and
performance already have reproducible budgets. Phase 13 has already implemented containers, CI,
releases, backup and rollback; it awaits closing the advanced test matrix and real validation with
Docker/GitHub/staging. The public repository is active and its first real CI run reached the Python
dependency audit. That audit alone failed because the workflow-created virtual environment retained
vulnerable `pip 25.0.1`; the narrow workflow correction remains pending explicit owner approval.
Repository documentation and the original master prompt are now in English, and the portfolio
README includes four reproducible product screenshots.
FollowRead Admin already provides the visual and functional flow for access, Dashboard, catalog,
creation, bilingual editor, illustrations, audio generation, review and publication. Reader
has four completed bilingual reads: **El zorro y la luna**, **The River Between Us**,
**El jardín secreto** and **La casa de los sonidos**. All have two chapters, cover, audio,
word highlighting, hand, auto-scroll, controls and progress recovery. Everything works with
SQLite; local voice remains available without an API key and there is an OpenAI option that generates MP3 and
word alignment exclusively from the API.

## Progress

| Indicator | Value |
|---|---:|
| Phase 0 tasks completed | 12 of 12 |
| Phase 1 tasks completed | 8 of 8 |
| Phase 2 tasks completed | 11 of 11 |
| Phase 3 tasks completed | 12 of 12 |
| Phase 4 tasks completed | 10 of 10 |
| Phase 5 tasks completed | 12 of 12 |
| Phase 6 tasks completed | 10 of 10 |
| Phase 7 tasks completed | 10 of 10 |
| Phase 8 tasks completed | 12 of 12 |
| Phase 9 tasks completed | 11 of 11 |
| Phase 10 tasks completed | 12 of 12 |
| Phase 11 tasks completed | 12 of 12 |
| Phase 12 tasks completed | 10 of 10 |
| Phase 13 tasks completed | 11 of 12 |
| Tasks in progress | 0 |
| Blocked tasks | 1 |
| Decisions accepted | 20 |
| Open decisions | 0 |
| Open risks | 8 |
| Known open issues | 0 |

## Status by component

| Area | Status | Note |
|---|---|---|
| FollowRead Admin | PHASE_5_COMPLETED | Editorial and publishing flow completed |
| FollowRead Reader | PHASE_11_COMPLETED | Web/PWA/mobile with learning and offline |
| FollowRead API | PHASE_9_COMPLETED | Canonical package and idempotent sync |
| Reader Engine | PHASE_7_COMPLETED | Deterministic engine without React or DOM |
| Audio / TTS | OPENAI_AUDIO_VALIDATED | Real bilingual MP3, synchronization and reuse at zero cost |
| Offline mode | PHASE_9_COMPLETED | Download, update, recovery and sync verified |
| Mobile / Capacitor | PHASE_10_COMPLETED | Android built/tested; iOS ready for Xcode |
| Cross-cutting quality | PHASE_12_COMPLETED | Security, a11y, load, metrics and regression green |
| CI/CD and deployment | PHASE_13_IN_PROGRESS | GitHub runner exercised; Python audit correction, Docker and staging pending |
| License | MIT | Public repository authorized by the owner |

## Closed deliverables for Phases 5 to 10

- breakdown of 12 tasks with dependencies and acceptance criteria;
- responsive admin shell with wide and compact navigation;
- Dashboard and visual catalog with realistic editorial states;
- login, restore and logout connected to the API without persisting tokens in web storage;
- navigation filtered by permissions received from the server;
- protected editorial summary with metrics, attention, recent content and audit from SQLite;
- protected editorial catalog with search, filters, sort, pagination and actions by permission;
- responsive form to create real drafts with languages, level and categories;
- responsive structural editor with chapters, paragraphs, autosave and local recovery;
- validated local upload of illustrations with mandatory alt description;
- visual processing with voices, cost, progress, errors, cancellation and retries;
- local generation of audio and Speech Marks linked to each paragraph;
- Amazon Polly limit implemented and tested exclusively with simulated client;
- reading package published with text, assets and Speech Marks;
- catalog of four published bilingual reads, original covers, in-house illustration for chapter 2 of **El zorro y la luna** and idempotent seeding in SQLite;
- reusable Reader Engine with temporal search, playback and progress;
- library and visual reader with active word, hand, auto-scroll, chapters and languages;
- filterable library, detail, favorites, history, vocabulary and local preferences;
- kid, adult and learning modes with audible device voice and visual fallback;
- installable PWA with exclusive shell cache;
- Capacitor 8 packaging only Reader;
- Android/iOS projects, icons and splash light/dark versioned;
- native connectivity and lifecycle without sensitive permissions;
- Android APK built, installed and rotated on API 35;
- safe areas and progress verified in portrait/landscape;
- review checklist and audited transitions up to publish, unpublish and archive;
- integrated documentation preserved and redesigned;
- 14 Admin tests, 42 Reader, 6 Reader Engine, 3 configuration and 111 API tests;
- coverage above 90% in Reader and 99% in Reader Engine/backend, with green builds.
- zero known moderate or higher vulnerabilities in JavaScript and zero in Python;
- bundles with deferred load, final local p95 of 107.9 ms and eight audited routes to 390 px.

## Blockers

The local product has no blockers: SQLite and the local adapters allow continuing without
PostgreSQL, Docker or AWS. The public repository and the MIT license are already resolved. Closing
Phase 13 still requires the approved CI audit correction, Docker, an authorized staging environment,
and completion or explicit exceptions for the thirteen pre-deployment categories. iOS requires
macOS/Xcode before TestFlight.

## Continuation rule

Correct and rerun the GitHub Python dependency audit after owner approval, then complete external
validation of Phase 13 with Docker and staging. Do not start Phase 14 nor mark the phase closed
without first recording the gates of `PHASE_13_REVIEW.md`.
