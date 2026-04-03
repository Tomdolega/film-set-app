# Closed Alpha Smoke Test

Use this checklist before inviting internal or external alpha testers.

## Preconditions

1. Run migrations with `npm run db:migrate`.
2. Seed demo data with `npm run db:seed:dev`.
3. Start the API with `npm run dev:api`.
4. Start the web app with `npm run dev:web`.
5. Keep `docs/demo-assets/demo-call-sheet.txt` ready for the document upload test.

The dev seed creates:

- demo user: `owner@example.com`
- demo password: `dev-password`
- demo organization and project
- demo contacts, crew, equipment, shooting days, and notifications

## Manual Verification

- Auth
  - Register a brand-new account and confirm you land on `/organizations`.
  - Log out, then log back in with the new account.
  - Confirm the organizations page shows existing organizations instead of only a create form.

- Organization and Project Creation
  - Create a new organization.
  - Create a project inside that organization.
  - Confirm the project detail page loads and saving project edits works.
  - Confirm invalid project dates are rejected when the start date is after the end date.

- Contacts and Crew
  - Create a contact in the organization.
  - Add that contact to the project crew.
  - Update the crew role and access role.
  - Remove a non-owner crew member and confirm the page handles errors inline if removal fails.

- Documents
  - Upload `docs/demo-assets/demo-call-sheet.txt` to a project.
  - Open the uploaded document detail page.
  - Open/download the file successfully.
  - Update document metadata and confirm the changes persist.
  - Delete the document and confirm it disappears from the project page.

- Scheduling
  - Create a new shooting day.
  - Confirm required fields block incomplete submissions.
  - Edit the seeded demo shooting days and confirm invalid time ranges are rejected.
  - Delete a shooting day and confirm failures show locally instead of crashing the page.

- Crew and Equipment Assignment
  - Assign crew to a shooting day.
  - Assign equipment to a shooting day.
  - Remove an assignment and confirm failures show inline.
  - Confirm empty assignment forms explain what to do when no resources are available.

- Conflict Detection
  - Open the seeded demo shooting day.
  - Confirm overlapping day warnings are shown.
  - Confirm the shared seeded crew member and seeded camera produce conflict notices.
  - Open the related shooting day from a conflict link.

- Notifications
  - Open `/notifications`.
  - Confirm seeded notifications are visible.
  - Mark one notification as read.
  - Mark all notifications as read.
  - Confirm failures show inline if the API rejects the action.

- Calendar Import / Export
  - Export a seeded shooting day to calendar.
  - Confirm a success message returns an external event ID.
  - Paste a valid event JSON payload into manual import and confirm it creates a shooting day.
  - Paste invalid JSON and confirm the UI shows a clear validation message.

- Equipment
  - Open organization equipment.
  - Create a new equipment item.
  - Edit the item status and notes.
  - Archive the item and confirm it no longer appears in the active list.

- Route Integrity
  - Manually alter a URL so the `organizationId` or `projectId` does not match the child resource.
  - Confirm the page shows a clear integrity error instead of rendering mismatched data.

## Deploy Check

Run `npm run deploy:check` before production or preview deployment handoff.
