# Nikhil Patel — Portfolio (Next.js)

A modern, full‑stack portfolio built with Next.js (App Router), React, and TypeScript. It includes public pages for Projects, Bookshelf, Music, and Contact, plus lightweight admin tooling (login + inline editing, file uploads, and image management) powered by API routes and JSON data.

## Features
- Projects, Bookshelf, and Music pages: data from `src/data/*.json`.
- Inline editing and login toggle for admin-only updates.
- File uploads and image management via `@vercel/blob`.
- JSON persistence with simple API routes for CRUD-like actions.
- CSS Modules for styling; zero Tailwind usage.

## Tech Stack
- Next.js 15 + App Router
- React 19, TypeScript 5
- CSS Modules
- @vercel/blob for uploads

## Project Structure
- `src/app`: routes, layouts, and API endpoints
- `src/components`: UI components (cards, forms, modals)
- `src/styles`: global CSS and CSS Modules
- `src/data`: content JSON for projects, books, playlists, tracks
- `src/utils`: helpers like `auth` and `getBaseUrl`

Key routes and clients:
- `src/app/page.tsx`: Home
- `src/app/projects/[slug]/page.tsx`: Project details
- `src/app/bookshelf/page.tsx` and `[slug]`
- `src/app/music/page.tsx` and `[slug]`
- `src/app/contact/page.tsx`
- `src/app/api/*`: data and upload endpoints

## Getting Started
Prerequisites: Node.js 18+ (or 20+ recommended) and npm.

1) Install dependencies
`npm install`

2) Set environment variables in `.env`
See Environment below.

3) Run the dev server
`npm run dev`
Visit `http://localhost:3000`.

4) Production build
`npm run build`
`npm start`

5) Lint
`npm run lint`

## Environment
Create a `.env` file in the project root with the following (as needed):
- `ADMIN_PASSWORD`: password for the admin login endpoint.
- `BLOB_READ_WRITE_TOKEN`: token for `@vercel/blob` read/write operations.
- `NEXT_PUBLIC_SITE_URL`: absolute base URL for linking (defaults to `http://localhost:3000`).

Never commit real secrets. An example `.env.local` can be used for local overrides.

## Data Model
Content lives in JSON files under `src/data`:
- `projects.json`, `books.json`, `playlists.json`, `tracks.json`, `homepage.json`
API routes read/modify these files and coordinate asset uploads/deletions using `@vercel/blob`.

## Notable Components
- `src/components/LoginToggle.tsx`: admin login/logout control
- `src/components/EditableText.tsx`: inline text editing
- `src/components/FileUploader.tsx`: upload helper
- `src/components/Footer.tsx`, `src/components/Header.tsx`: layout pieces

## API Notes
Find endpoints under `src/app/api/*` (RESTful `route.ts` handlers). Examples:
- `api/projects/[slug]` (GET/PUT)
- `api/projects/attach`, `deleteAttachment`, `reorderAttachment`
- Similar endpoints for `books`, `tracks`, and `playlists`
- `api/upload` for blob uploads
- `api/login`, `api/logout` for auth

## Deployment
This app deploys cleanly to platforms that support Next.js (e.g., Vercel). Ensure environment variables are configured in your host, and that `BLOB_READ_WRITE_TOKEN` is set if using blob uploads.

## Development Notes
- The repository was flattened: the previous `my-portfolio/` subfolder has been removed so the Next.js app now lives at the repo root.
- If you cloned an older layout, remove any obsolete nested app folders before running the commands above.
