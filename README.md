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
npm run seed
```

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

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run seed` | Seed database with initial quotes |

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Docs**: Swagger UI
- **Deployment**: Fly.io

## License

ISC
