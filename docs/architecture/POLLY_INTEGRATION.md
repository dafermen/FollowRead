# Audio and Speech Marks Integration

## Phase 6 Outcome

FollowRead can convert a structured translation into audio and timing marks without coupling the
domain to Amazon Polly. The MVP default mode is local, deterministic, and free. The AWS limit is
implemented behind the same contract and is only activated explicitly in an environment that
has the SDK and credentials.

## Flow

1. Admin sends version, language, voice, and idempotency key.
2. The API validates session, CSRF, permission, translation, and voice language.
3. The service joins paragraphs while preserving their character ranges.
4. It computes a SHA-256 fingerprint of the text, language, voice, provider, and configured models.
5. If an MP3 ready with the same fingerprint exists, it returns a job `cached` with zero cost and does not
   call the provider.
6. If the fingerprint changed or the file is missing, it computes `caracteres × 0.000004 USD` and applies the limit.
7. The text is split without cutting words, with a configurable maximum per fragment.
8. The adapter generates audio and word marks. Transient calls are retried up to three
   times.
9. External timestamps are adjusted to a monotonic sequence before accumulating times and linking
   each mark to the paragraph that contains its character.
10. The audio and its source fingerprint are saved to SQLite/local storage; the job ends
    as completed or failed.
11. If the version has an active publication, the API recalculates its checksum with the final package
    so Reader and offline bootstrap detect the new audio.

## Adapters

- `FakePollyAdapter`: default option. Produces reproducible data, uses no network, and is suitable
  for development, demos, and all automated tests.
- `AwsPollyAdapter`: makes an MP3 request and a Speech Marks request to an Amazon Polly-compatible client. The client is created lazily only when the provider is `aws`.
- `OpenAITtsAdapter`: generates an MP3 with a natural voice and aligns words with timestamps. The
  key is read exclusively from `OPENAI_API_KEY` in the API.
- `RetryingPollyAdapter`: keeps up to three attempts per fragment and propagates the final error
  so it is recorded in the job diagnostics.
- `LocalAudioStorage`: writes to the configured local directory. The contract allows replacing it
  with object storage in a later phase.

## Security and operation

- The browser never receives AWS credentials nor invokes Polly directly.
- The browser also does not receive `OPENAI_API_KEY`: it only plays the published MP3.
- All mutations require a session cookie, permission `content.process`, allowed origin, and CSRF.
- The idempotency key prevents duplicates from resubmitted requests.
- The persistent cache prevents new paid calls even if Admin sends another request: it is only
  regenerated when the text, language, voice, provider/models change or when the MP3 is missing.
- An included package can be updated when the editorial checksum changes; a user-initiated download is never silently replaced.
- A valid cache with overlapping old marks is repaired locally and keeps the MP3, so the fix does not perform a new paid call.
- The cost limit is evaluated before any call to the provider.
- Stored errors are limited to 500 characters.
- No automated test uses an actual AWS account, secret, or call.

## Administrative API

| Method | Path | Use |
|---|---|---|
| `GET` | `/admin/voices` | supported voices by language |
| `GET` | `/admin/processing` | recent activity and diagnostics |
| `POST` | `/admin/processing` | start idempotent generation |
| `POST` | `/admin/processing/{id}/retry` | retry a failure |
| `POST` | `/admin/processing/{id}/cancel` | cancel a pending job |

The `/processing` screen shows language, voice, maximum cost, progress, status, error, and actions. In
development it retains a visual preview when the API does not have an active session.
