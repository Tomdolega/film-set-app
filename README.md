# Film Set App

MVP monorepo for project, crew, contacts, and documents management.

## Current scope

- `infra/database`
- `domains/auth`
- `domains/contacts`
- `domains/crew`
- `domains/documents`
- `domains/equipment`
- `domains/organizations`
- `domains/projects`
- `domains/scheduling`
- `apps/api`
- `apps/web`

## Source of truth

Planning lives in the `.pages` documents in the repo root.

## Locked stack

- TypeScript
- Express
- PostgreSQL
- Drizzle ORM
- Mock session auth for now
- Local filesystem storage for documents

## Run locally

### 1. Start PostgreSQL with Docker

```bash
docker run --name film-set-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=film_set_app \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Configure environment

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Leave `LOCAL_STORAGE_ROOT=storage/uploads` unless you want document files stored elsewhere.

### 3. Generate and run migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Optional dev seed

```bash
npm run db:seed:dev
```

### 5. Start the API

```bash
npm run dev:api
```

The API starts on `http://localhost:3001`.

### 6. Start the web app

In a second terminal:

```bash
npm run dev:web
```

The web app starts on `http://localhost:3000`.
It uses `http://127.0.0.1:3001` as the API base URL by default.

### 7. Validate the browser flow

1. Open `http://localhost:3000`.
2. Create an organization.
3. Create a project inside that organization.
4. Open the project detail page.
5. Edit the basic project fields and save.
6. Upload a document from the project page.
7. Open the document detail page, update its metadata, and delete it.
8. Open the schedule page, create a shooting day, assign crew, and review conflicts/call sheet.
9. Open the equipment page, create a real equipment item, and assign it to a shooting day.

## Document storage

- Uploaded project files are stored on local disk under `storage/uploads`.
- The database stores only document metadata plus the relative `storageKey`.
- Deleting a document removes the metadata record and deletes the stored file from local storage.
