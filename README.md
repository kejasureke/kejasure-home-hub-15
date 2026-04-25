# Lovable Project

[![CI](../../actions/workflows/ci.yml/badge.svg?branch=main)](../../actions/workflows/ci.yml)

The CI badge above reflects the **`captionSafety` coverage threshold** on `main`:
the workflow fails (and the badge turns red) whenever coverage of
`src/utils/captionSafety.ts` drops below the gate defined in `vitest.config.ts`
(100% lines / functions / statements, 95% branches).

> The badge uses GitHub's relative `../../` path so it resolves automatically
> for whatever account/repo this project is synced to via Lovable's GitHub
> integration. No hardcoded org/repo to update.

## Development

```bash
bun install
bun run dev
```

## Testing

```bash
# Run the full unit test suite
bun run test

# Run with the coverage gate (matches CI)
bun run test:coverage

# Run only the captionSafety regression suite
bunx vitest run src/utils/captionSafety.test.ts
```

The HTML coverage report is written to `./coverage/index.html`. After a CI run,
the same report is uploaded as the `coverage-html` artifact and the
`coverage-summary.json` is uploaded as `coverage-json-summary` — both available
even when the threshold gate fails, so you can inspect which `captionSafety`
branch regressed.
