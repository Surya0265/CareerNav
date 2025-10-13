# CareerNav Frontend (React + TypeScript)

This project delivers a focused UI for the CareerNav platform, enabling students and fresh graduates to:

- Upload resumes and collect AI-powered insights.
- Review tailored recommendations, skill gaps, and learning paths.
- Generate actionable career timelines and visualize Mermaid diagrams.

The app is built with Vite, React 19, TypeScript, React Router, React Query, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:5173> and proxies `/api/*` calls to the Node backend on port `3011`.

### Environment variables

Optional overrides can be provided via a `.env` file:

```
VITE_API_BASE_URL=http://localhost:3011/api
```

## Available scripts

| Script         | Description                              |
| -------------- | ---------------------------------------- |
| `npm run dev`  | Start the Vite dev server.                |
| `npm run build`| Type-check and create a production build. |
| `npm run lint` | Run ESLint across the project.            |
| `npm run preview` | Preview the production build locally. |

## Key directories

- `src/app` – Core app component and global providers (auth, React Query, toasts, career data cache).
- `src/components` – Layout elements and shared UI primitives (buttons, cards, form fields, toasts, etc.).
- `src/pages` – Feature screens (dashboard, resume upload, AI analysis, timeline, auth screens).
- `src/services` – Axios wrappers for backend APIs.
- `src/types` – Shared TypeScript models.
- `ARCHITECTURE.md` – Detailed design notes and future enhancements.

## Backend expectations

The frontend integrates with the existing CareerNav backend:

- Node/Express service at `http://localhost:3011/api` (resume upload, AI analysis, timelines, auth).
- Python Flask AI service proxied through the Node API.

Ensure both servers are running before uploading resumes or generating timelines.

## Testing checklist

- `npm run lint` – Validates code style and catches common issues.
- `npm run build` – Ensures the TypeScript compilation and Vite build succeed.

## Accessibility & UX

- Strict color contrast with Tailwind-based theming.
- Responsive layouts (mobile nav pill bar, desktop sidebar shell).
- Toast notifications for long-running operations.
- State is reset on logout to keep user data scoped per session.

## Next steps

- Add integration tests (e.g., Playwright) for core flows.
- Persist cached AI/timeline responses via backend endpoints for historical tracking.
- Add loading skeletons for analysis/timeline sections.
- Enhance toast system with queue priorities and actions.
