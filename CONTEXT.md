# Context: olato-quote

## Overview

Olato Quote is a public REST API serving random quotes across categories (motivation, love, success). Hosted on RapidAPI, deployed on Fly.io, backed by MongoDB Atlas.

## Glossary

- **Quote**: A single inspirational or notable saying, attributed to an author.
- **Category**: A label that groups related quotes. Currently flat string keys (e.g., `motivation`, `love`, `success`, `inspiration`).
- **Category slug**: The URL-safe lowercase string identifying a category (e.g., `motivation`).
- **Response envelope**: Standard JSON structure `{ data: ..., status: "ok"|"error", message: "..." }` for all responses.

## Entities

### Quote
- `text`: string — the quote content
- `author`: string — the quote's author
- `category`: string — the category slug this quote belongs to

Persisted in MongoDB Atlas. Each quote is a document in a `quotes` collection.

### Category
- `slug`: string — URL-safe identifier
- Quotes are grouped by category slug at runtime; no persistence layer

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
- All responses use a standard envelope: `{ data: ..., status: "ok"|"error", message: "..." }`
- Errors include `availableCategories` when a category is invalid
- CORS enabled for all origins
- Logging via Morgan (`combined`)
- Environment config via `dotenv`
- MongoDB Atlas for persistence, Mongoose for modeling
- Seed script (`npm run seed`) for initial data
- Type definitions in `types/` directory (Quote, Category, ApiResponse)
