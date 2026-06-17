# KejaSure

Mobile-only UI/UX prototype for Kenya's trusted rental marketplace.
Built with Vite + React + Tailwind, wrapped via Capacitor for native mobile.

```bash
bun install
bun run dev
```

Open on a mobile viewport (≤768px) — desktop is intentionally blocked.

## CI Android builds

Latest debug APK is built on push to `main` and available as an Actions artifact.

![Android build](https://github.com/kejasureke/kejasure-home-hub-15/actions/workflows/android-build.yml/badge.svg)

To produce a signed release APK via CI, set the following repository secrets:

- `KEYSTORE_BASE64` (base64-encoded keystore file)
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

The workflow will create `app-release.apk` when those secrets are set.
