<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Web Context

## Product Role
- `apps/web` is the internal barbershop management panel.
- This app should optimize for operators, owners, and staff managing the business.

## UX Defaults
- Development is mobile first by default.
- Design the core flow for small screens before desktop enhancements.
- Desktop can expand density, but mobile should remain the reference experience.
- Important actions should stay obvious and reachable on mobile.
- Avoid layouts that assume multiple wide columns as the baseline.

## UI Patterns
- Follow the current app-router structure in `app/` and colocate page-specific UI when that keeps the flow clearer.
- Reuse the visual language already present: dark surfaces, amber highlights, rounded cards, and compact management UI.
- Prefer incremental enhancements over introducing large component frameworks or styling abstractions.
- When building management flows, keep feedback states explicit: loading, empty, error, and success.

## Data Integration
- Use the existing `apiClient` and auth helpers.
- Respect barbershop scoping through the authenticated flow instead of duplicating tenancy logic in the frontend.
- Prefer small client-side state models that are easy to reason about over complex global state.
