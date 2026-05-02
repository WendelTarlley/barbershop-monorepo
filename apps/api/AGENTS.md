# API Context

## Stack
- This app uses NestJS 11 with Prisma.
- Business rules should live in services, not in controllers.
- Controllers should stay thin and primarily validate transport-level concerns.

## Data And Contracts
- Reuse DTOs from `@barbershop/shared` whenever the contract is shared across apps.
- If a contract is API-specific and not truly shared yet, keep it local to the module until reuse is clear.
- Barbershop-scoped reads and writes should honor the current barbershop context instead of trusting raw ids from the client.
- Prefer explicit validation and clear `BadRequestException` or `NotFoundException` messages over silent coercion.

## Module Patterns
- Follow the existing Nest module structure: `controller`, `service`, `dto`, and tests when practical.
- Keep Prisma queries readable and scoped; avoid embedding large business decisions directly inside query objects.
- When returning Prisma decimals or other transport-unfriendly values, serialize them explicitly.

## Verification
- For local validation, prefer `npx tsc --noEmit` and targeted `eslint` runs before broader commands.
- Avoid destructive build cleanup when the workspace is already in use by the developer.
