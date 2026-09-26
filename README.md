# Olato Quote API

A public REST API serving random quotes across categories (motivation, love, success, inspiration).

## Live Demo

- **API**: https://olato-quote.fly.dev
- **Docs**: https://olato-quote.fly.dev/docs

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/your-username/olato-quote.git
cd olato-quote
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string:

```
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### Seed Database

```bash
npm run seed:upsert
```

Idempotent: adds the starter quotes, leaves everything already in the database alone.

```bash
npm run seed:reset
```

Destructive: deletes every quote first. This also deletes anything ingestion has added.

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

## API Endpoints

### Health Check

```
GET /health
```

Response:

```json
{
  "data": { "status": "ok" },
  "status": "ok",
  "message": "Service is healthy"
}
```

### Get All Categories

```
GET /v1/categories
```

Response:

```json
{
  "data": [
    { "slug": "motivation", "name": "Motivation" },
    { "slug": "love", "name": "Love" },
    { "slug": "success", "name": "Success" },
    { "slug": "inspiration", "name": "Inspiration" }
  ],
  "status": "ok",
  "message": "Categories retrieved"
}
```

### Get Random Quote

```
GET /v1/quotes
```

Response:

```json
{
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "motivation"
  },
  "status": "ok",
  "message": "Random quote retrieved"
}
```

Quotes added by ingestion also carry where they came from:

```json
{
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "text": "Champions aren't made in gyms, they are made from something they have deep inside them.",
    "author": "Luca Anchorre",
    "category": "success",
    "source": "Wikiquote",
    "sourceUrl": "https://en.wikiquote.org/wiki/Success",
    "license": "CC BY-SA 3.0"
  },
  "status": "ok",
  "message": "Random quote retrieved"
}
```

### Get Random Quote by Category

```
GET /v1/quotes/:category
```

Parameters:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| category | string | Yes | Category slug (motivation, love, success, inspiration) |

Response (success):

```json
{
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "text": "Believe you can and you're halfway there.",
    "author": "Theodore Roosevelt",
    "category": "motivation"
  },
  "status": "ok",
  "message": "Random quote retrieved"
}
```

Response (invalid category):

```json
{
  "data": null,
  "status": "error",
  "message": "Category not found",
  "availableCategories": ["motivation", "love", "success", "inspiration"]
}
```

## Quote Ingestion

New quotes are harvested from [Wikiquote](https://en.wikiquote.org) once a month by a GitHub Actions
workflow, so the collection grows without anyone maintaining it by hand.

Each run reads the four Wikiquote topic pages, then for every quote it fetches it:

- cleans the wikitext and drops anything that still contains markup, is too short or too long, or is
  not in English
- takes the author from the quote's attribution line, skipping anonymous and unknown authors
- assigns a category from the source's own topic label, falling back to keyword matching
- skips anything already in the database, compared on a normalised form of the quote text

Accepted quotes are written straight to the published collection, each with the source, source URL
and licence it was published under. Runs are recorded in the `ingestionruns` collection, so growth
and failure stay queryable after the fact.

```bash
npm run ingest                    # run a full ingestion
npm run ingest -- --limit 10      # accept at most 10 new quotes
npm run ingest -- --dry-run       # report what would be added, write nothing
```

`--dry-run` still reads the live database, so the duplicate counts it reports are real.

### The monthly workflow

`.github/workflows/ingest.yml` runs at 06:17 UTC on the first of every month. It needs two
repository secrets: `MONGODB_URI` and `INGEST_USER_AGENT` (a contact string, as Wikimedia's policy
asks of automated clients). It can also be triggered by hand from the Actions tab.

The job fails if a run accepts nothing, which is the signal that the source has been exhausted or
broken. Otherwise it succeeds and writes its counts to the job summary.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run seed:upsert` | Add the starter quotes, leaving existing quotes alone |
| `npm run seed:reset` | Delete all quotes, then add the starter quotes |
| `npm run ingest` | Run quote ingestion (`--dry-run`, `--limit`) |
| `npm run lint` | Lint and check formatting with Biome |
| `npm run format` | Apply Biome's safe fixes and formatting |
| `npm run typecheck` | Type-check without emitting output |

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Docs**: Swagger UI
- **Linting and formatting**: Biome
- **Deployment**: Fly.io

## License

ISC
