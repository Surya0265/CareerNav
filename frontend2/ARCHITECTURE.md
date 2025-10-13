# CareerNav Frontend2 Architecture

## Goals
- Provide a minimal, accessible UI for students/freshers to: upload resumes, view AI-powered analysis, and track generated career timelines.
- Integrate seamlessly with the existing CareerNav backend APIs (`/api/resume`, `/api/ai`, `/api/timeline`, `/api/users`).
- Maintain clean separation of concerns with predictable state management and request caching.

## Technology Stack
- **Framework:** React 19 with TypeScript.
- **Bundler:** Vite 7 (ESM).
- **Routing:** `react-router-dom` for client-side routing across the three primary flows.
- **Data Fetching:** `@tanstack/react-query` for request lifecycle management, caching, and optimistic updates.
- **Styling:** Tailwind CSS for rapid, minimal styling paired with reusable utility classes.
- **Form Handling:** Native browser forms + lightweight helpers (no heavy form library required).
- **State:** Local component state + React Query caches. JWT token stored in memory via context (with optional persistence to `sessionStorage`).

## High-Level Structure
```
frontend2/
  src/
    app/
      App.tsx          # Router and layout wiring
      providers/       # React Query and Auth providers
    components/
      layout/          # Header, navigation, panels, loading states
      resume/          # Upload form, file dropzone, skill list, analysis sections
      timeline/        # Timeline list, cards, empty state
      shared/          # Buttons, cards, form controls
    hooks/
      useAuth.ts       # Authentication helpers
      useResume.ts     # Resume upload + polling logic
      useAnalysis.ts   # AI analysis fetching logic
      useTimeline.ts   # Timeline retrieval & refresh
    pages/
      Dashboard.tsx    # Landing with quick actions + aggregated info
      ResumeUpload.tsx
      Analysis.tsx
      Timeline.tsx
      Login.tsx / Signup.tsx (optional if auth enforced)
    services/
      apiClient.ts     # Axios instance with interceptors
      resume.ts        # API calls for resume upload/extract
      analysis.ts      # AI analysis API calls
      timeline.ts      # Timeline API calls
      auth.ts          # Login/signup/profile endpoints
    styles/
      index.css        # Tailwind base + custom tokens
    utils/
      formatters.ts    # Shared data formatting helpers
```

## Routing Contract
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Dashboard` | Overview of the user's latest resume upload, AI insights, and timeline summary. |
| `/resume` | `ResumeUploadPage` | Primary resume upload form with dropzone and history. |
| `/analysis` | `AnalysisPage` | Shows AI-generated analysis results in cards/tabs. |
| `/timeline` | `TimelinePage` | Displays generated timeline milestones with status and next steps. |
| `/login`, `/signup` | (Optional) Access-controlled routes if JWT auth is required. |

## Data Flow
1. **Auth Context** stores the JWT token after login and exposes helpers for API clients.
2. **React Query** queries/mutations wrap API calls, automatically handling loading/error states.
3. **Resume Upload** triggers a mutation (`POST /api/resume/upload`), stores resume metadata, and re-fetches AI analysis.
4. **AI Analysis** query (`GET /api/ai/analysis?resumeId=`) fetches latest insights. When the resume upload mutation completes, React Query invalidates this query.
5. **Timeline** query (`GET /api/timeline/:userId`) fetches timeline items. Users can request regeneration via mutation hitting `/api/timeline/generate`.

## Error Handling & Notifications
- Centralized toast/snackbar system displaying success/info/error messages.
- API layer normalizes backend errors into `{ message, statusCode, details }`.
- Global error boundary for catastrophic rendering issues.

## Styling Guidelines
- Use Tailwind utility classes for layout/spacing/typography.
- Shared components (e.g., `PrimaryButton`, `Card`, `EmptyState`) live under `components/shared`.
- Keep color palette friendly and accessible (WCAG AA). Provide light/dark theme toggles if time allows.

## Future Enhancements
- Persist JWT tokens securely (session storage with refresh tokens).
- Add user settings and profile management.
- Introduce skeleton loaders for AI analysis and timeline sections.
- Instrument analytics (page view, feature usage).
- Add E2E tests with Playwright once flows stabilize.
