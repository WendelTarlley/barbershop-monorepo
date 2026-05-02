# Barbershop Monorepo

## Scope
- This repository is an npm workspace monorepo with `apps/*` and `packages/*`.
- Prefer keeping logic close to the owning app or package instead of creating cross-app coupling.
- Shared contracts, DTOs, and reusable types belong in `packages/shared`.
- Database schema and Prisma-related contracts belong in `packages/database`.

## Product And UX Defaults
- Frontend work is mobile first by default.
- Always design the primary interaction for small screens before expanding to tablet or desktop.
- Keep critical actions reachable on mobile without requiring deep scrolling or wide layouts.
- Respect the visual language already present in each app instead of introducing a new design system casually.
- Prefer simple, testable MVP flows over speculative abstractions.

## Engineering Defaults
- Prefer targeted changes over broad refactors unless the task explicitly asks for restructuring.
- Preserve worktree changes that are unrelated to the current task.
- Validate only the scope you changed whenever the repo has known unrelated failures.
- When starting a new session or switching to a new task context, create a dedicated git worktree before editing so unrelated changes do not mix in the same workspace.
- When a rule is app-specific, define it in the nearest `AGENTS.md` inside that app.

## Cross-App Boundaries
- `apps/api` is the source of truth for business rules and persistence.
- `apps/web` is the internal barbershop management panel.
- `apps/customer-web` is the external customer-facing scheduling experience.
- Do not move management-panel assumptions into `customer-web`, and do not leak customer-flow assumptions into `web`.
