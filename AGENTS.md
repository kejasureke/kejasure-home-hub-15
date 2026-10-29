# Project Notes

## Safe areas / status bar
- Every full-screen overlay, sticky top header, and back-button bar must include safe-area top padding: use `pt-safe` (1.5rem base) or `pt-safe-compact` (0.75rem base) from `src/index.css` — never bare `pt-4`/`py-3` on an element that sits at the viewport top, or it hides under the phone's status bar in the Despia webview.
- `index.html` viewport meta must keep `viewport-fit=cover` (needed for `env(safe-area-inset-*)` to report real values).
- Despia editor status bar settings: Fullscreen Mode ON + Auto-Inject Safe Area OFF. The app applies `var(--safe-area-top)` itself; Despia injects the variables in every webview (leaving Auto-Inject on with Fullscreen on causes double padding).

## Despia wrapper
- Web app changes need only a publish (app loads from `https://kejasureapp.lovable.app`); wrapper-level changes (icon, splash, URL scheme, status bar settings, permissions) need a new Despia build.

## Legal content
- Use shared LegalContent for signup, Settings and public policy pages to prevent conflicting disclosures.
- Public /privacy, /terms and /delete-account pages bypass onboarding and the desktop blocker so store reviewers and former users can access them without an account.
- Deletion requests currently use the existing support email; do not present email initiation as completed account deletion or store-compliant automated deletion.
