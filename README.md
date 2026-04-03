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
- Session-based auth with email + password
- S3-compatible object storage for documents

## Deployment shape

Recommended MVP deployment:

- Web: Vercel
- API: Railway or Render
- Database: managed PostgreSQL
- Storage: S3-compatible bucket such as Cloudflare R2, AWS S3, or Supabase storage with S3 compatibility

The web app keeps the session cookie on the web domain and forwards it to the API server-side. That means the app can work when the web and API are hosted on different domains.

## Required environment variables

Shared runtime values:

- `DATABASE_URL`
- `WEB_URL`
- `API_URL`
- `PORT`
- `CORS_ALLOWED_ORIGINS`
- `TRUST_PROXY`

Session/auth:

- `SESSION_COOKIE_NAME`
- `SESSION_COOKIE_SECURE`
- `SESSION_COOKIE_SAME_SITE`
- `SESSION_COOKIE_DOMAIN`

Uploads/storage:

- `DOCUMENT_UPLOAD_MAX_BYTES`
- `STORAGE_ENDPOINT`
- `STORAGE_REGION`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `STORAGE_FORCE_PATH_STYLE`
- `STORAGE_SIGNED_URL_TTL_SECONDS`

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
3. Configure the storage variables for your S3-compatible bucket.
4. Keep `SESSION_COOKIE_SECURE=false` locally.
5. Keep `WEB_URL=http://localhost:3000` and `API_URL=http://localhost:3001` locally.

### 3. Start local object storage for development

This example uses MinIO as a local S3-compatible backend:

```bash
docker run --name film-set-minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  -d minio/minio server /data --console-address ":9001"
```

Then create the `film-set-app` bucket in the MinIO console at `http://localhost:9001`.

### 4. Generate and run migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Optional dev seed

```bash
npm run db:seed:dev
```

The seed now creates a reusable closed-alpha demo workspace with a demo project, contacts, crew,
equipment, shooting days, and notifications. It also prints the seeded IDs and points to the sample
upload asset at `docs/demo-assets/demo-call-sheet.txt`.

### 6. Start the API

```bash
npm run dev:api
```

The API starts on `http://localhost:3001`.

### 7. Start the web app

In a second terminal:

```bash
npm run dev:web
```

The web app starts on `http://localhost:3000`.
It uses `http://localhost:3001` as the API base URL by default.

### 8. Validate the browser flow

1. Open `http://localhost:3000`.
2. Register or log in.
3. Create an organization.
4. Create a project inside that organization.
5. Open the project detail page.
6. Edit the basic project fields and save.
7. Upload a document from the project page.
8. Open the document detail page, open/download the file, update its metadata, and delete it.
9. Open the schedule page, create a shooting day, assign crew, and review conflicts/call sheet.
10. Open the equipment page, create a real equipment item, and assign it to a shooting day.

## Document storage

- Uploaded project files are stored in an S3-compatible bucket.
- Object keys use the pattern `organizations/{organizationId}/projects/{projectId}/documents/{documentId}/{filename}`.
- The database stores document metadata plus the object `storageKey`, original filename, mime type, and file size.
- File access goes through `GET /documents/:documentId/download`, which validates project access and redirects to a signed storage URL.
- Deleting a document removes the metadata record and deletes the stored object.

## Production deployment

### 1. Create managed services

1. Provision PostgreSQL.
2. Provision an S3-compatible bucket.
3. Decide the final public URLs for the web app and API.

### 2. Configure production environment variables

API service:

- `DATABASE_URL`
- `PORT`
- `WEB_URL=https://your-web-domain`
- `API_URL=https://your-api-domain`
- `CORS_ALLOWED_ORIGINS=https://your-web-domain`
- `TRUST_PROXY=true`
- `SESSION_COOKIE_NAME=session_id`
- `SESSION_COOKIE_SECURE=true`
- `SESSION_COOKIE_SAME_SITE=lax`
- `SESSION_COOKIE_DOMAIN=`
- `DOCUMENT_UPLOAD_MAX_BYTES=20971520`
- all `STORAGE_*` values

Web service:

- `API_URL=https://your-api-domain`
- `WEB_URL=https://your-web-domain`
- `SESSION_COOKIE_NAME=session_id`
- `SESSION_COOKIE_SECURE=true`
- `SESSION_COOKIE_SAME_SITE=lax`
- `SESSION_COOKIE_DOMAIN=`

Keep `SESSION_COOKIE_DOMAIN` blank unless you intentionally want to share the cookie across subdomains on the same parent domain.

### 3. Deployment order

1. Provision database and storage.
2. Set API environment variables.
3. Run `npm run db:migrate:prod` against the production database.
4. Deploy the API.
5. Set web environment variables.
6. Deploy the web app.
7. Run the smoke test checklist below.

### 4. Deploy the API

For Railway or Render:

1. Point the service at this repo.
2. Use the repo root as the working directory.
3. Set the start command to `npm run start:api`.
4. Set all API environment variables listed above.
5. Make sure the service can reach the managed PostgreSQL instance and the storage endpoint.

The API has a health route and should answer `GET /health` after boot.

### 5. Deploy the web app

For Vercel:

1. Create a Vercel project from this repo.
2. Set the root directory to `apps/web`.
3. Set the install command to `npm install`.
4. Set the build command to `npm run build:web`.
5. Set the web environment variables listed above.

The web app uses `API_URL` for server-side calls into the API. It does not rely on browser-side direct API auth for the login flow.

### 6. Production migration flow

Run migrations from an environment that has the production `DATABASE_URL`:

```bash
npm run db:migrate:prod
```

Run migrations before deploying the new API version if the release depends on schema changes.

### 7. Post-deploy smoke test

Use the full checklist in [docs/closed-alpha-smoke-test.md](docs/closed-alpha-smoke-test.md).

Minimum production verification:

1. Open the deployed web app and log in.
2. Confirm existing organizations are listed after sign-in.
3. Create an organization and a project.
4. Upload a real document and open the downloaded file.
5. Create or edit a shooting day and confirm conflicts still load.
6. Open notifications and mark one item as read.
7. Confirm `GET https://your-api-domain/health` returns healthy status.

### 8. Useful pre-deploy check

```bash
npm run deploy:check
```
