<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Customer Web Context

## Product Role
- `apps/customer-web` is the external customer-facing experience.
- The UX should feel simpler, more guided, and less operational than the internal `web` panel.

## UX Defaults
- Development is mobile first by default.
- The customer journey should prioritize clarity, trust, and low friction on small screens.
- Prefer linear flows, obvious primary CTAs, and minimal cognitive load.
- Avoid exposing internal management concepts unless the feature explicitly requires them.

## UI Patterns
- Preserve the visual identity already present in this app rather than copying management-panel layouts from `apps/web`.
- Customer-facing copy should be clearer and more supportive than admin-facing copy.
- Empty, loading, and error states should be friendly and explain the next step.

## Integration Defaults
- Reuse shared contracts and API endpoints where possible, but keep customer-specific orchestration inside this app.
- Do not assume the customer is authenticated unless the current flow explicitly requires it.
