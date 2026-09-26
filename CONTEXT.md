# Context: olato-quote

## Overview

Olato Quote is a public REST API serving random quotes across categories (motivation, love, success). Hosted on RapidAPI, deployed on Fly.io, backed by MongoDB Atlas.

## Glossary

- **Quote**: A single inspirational or notable saying, attributed to an author.
- **Category**: A label that groups related quotes. A closed set of flat string keys (`motivation`, `love`, `success`, `inspiration`); no new categories are introduced by ingestion.
- **Category slug**: The URL-safe lowercase string identifying a category (e.g., `motivation`).
- **Response envelope**: Standard JSON structure `{ data: ..., status: "ok"|"error", message: "..." }` for all responses.
- **Source**: An upstream body of quotes that quotes are acquired from. A source carries its own attribution obligations, so every acquired quote must remain traceable to the source it came from.
- **Candidate**: A quote extracted from a Source that has not yet been accepted — not yet validated, classified, or known to be new.
- **Dedup key**: The normalized form of a quote's text used to decide whether a candidate is *new*. Two quotes with the same dedup key are the same quote.
- **Ingestion**: The recurring acquisition of new Quotes from a Source, and their addition to the published collection.
- **Ingestion run**: One execution of ingestion, with a record of what it fetched, accepted, and rejected.
- **Attribution**: The provenance a Source requires of an acquired Quote — who published it, where it came from, and under what terms. Every ingested Quote carries its attribution; the obligation travels with the Quote.
- **Classifier**: The rule that assigns a Category to a Candidate. It may use the Source's own topic labels first, then fall back to the quote text. A Candidate neither classifies nor duplicates is rejected, not published.

## Entities

### Quote
- `text`: string — the quote content
- `author`: string — the quote's author
- `category`: string — the category slug this quote belongs to
- `source`, `sourceUrl`, `license`: the Quote's Attribution, present on every ingested Quote

Persisted in MongoDB Atlas. Each quote is a document in a `quotes` collection.

### Category
- `slug`: string — URL-safe identifier
- Quotes are grouped by category slug at runtime; no persistence layer

### Ingestion run
- `source`, `startedAt`, `finishedAt`, `status`
- `fetched`, `accepted`, `duplicate`, `rejected` counts

The durable record of one run, kept so growth and failure are queryable after the fact rather than only in CI logs.

## Endpoints (v1)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/` | Welcome message |
| GET | `/v1/quotes` | Random quote from any category |
| GET | `/v1/quotes/:category` | Random quote from a specific category |
| GET | `/v1/categories` | List available categories |
| GET | `/health` | Health check |

## Conventions

- TypeScript with `tsx` for dev, `tsc` for production build
- Biome for linting and formatting; `npm run lint` and `npm run build` must both pass
- All responses use a standard envelope: `{ data: ..., status: "ok"|"error", message: "..." }`
- Errors include `availableCategories` when a category is invalid
- CORS enabled for all origins
- Logging via Morgan (`combined`)
- Environment config via `dotenv`
- MongoDB Atlas for persistence, Mongoose for modeling
- Seed scripts for the starter quotes: `seed:upsert` (idempotent) and `seed:reset` (destructive)
- Ingestion runs monthly from CI, auto-publishing every quote it accepts
- Type definitions in `types/` directory (Quote, Category, ApiResponse)
