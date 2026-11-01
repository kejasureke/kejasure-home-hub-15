# Project Notes

## Safe areas / status bar
- Paid-access plan pickers must open in a body-level modal portal with their own scroll area and sticky back bar, so transformed listing containers cannot clip them or lose the reading position.
- Every full-screen overlay, sticky top header, and back-button bar must include safe-area top padding: use `pt-safe` (1.5rem base) or `pt-safe-compact` (0.75rem base) from `src/index.css` — never bare `pt-4`/`py-3` on an element that sits at the viewport top, or it hides under the phone's status bar in the Despia webview.
- `index.html` viewport meta must keep `viewport-fit=cover` (needed for `env(safe-area-inset-*)` to report real values).
- Despia editor status bar settings: Fullscreen Mode ON + Auto-Inject Safe Area OFF. The app applies `var(--safe-area-top)` itself; Despia injects the variables in every webview (leaving Auto-Inject on with Fullscreen on causes double padding).

## Despia wrapper
- Web app changes need only a publish (app loads from `https://kejasureapp.lovable.app`); wrapper-level changes (icon, splash, URL scheme, status bar settings, permissions) need a new Despia build.

## House-hunting extensions
- Use the shared viewing-limit helper for the mobile request-screen pending count; local booking state is not server-enforced account entitlement.
- Use the shared paid-access hook for contact and booking UI; require both a current account subscription and booking acceptance for phone reveals, because cached booking status alone is not paid entitlement.
- Profile plan labels and paid action gates use the same subscription window check; never reveal generated phone numbers or auto-accept bookings, because local simulations are not account entitlement or provider consent.
- Keep supplemental listing disclosures and private viewing notes in the shared house-hunting module; local-only observations must never imply a provider notification or a shared listing update.
- Low-data galleries must not mount property images until explicitly requested; commute displays use supplied provider estimates, never invented routes or fares.

## Legal content
- Translate app-owned display copy through the shared language store and catalog at render time; preserve canonical stored values and user-authored content so switching languages never changes account or listing data.
- Use shared LegalContent for signup, Settings and public policy pages to prevent conflicting disclosures.
- Public /privacy, /terms and /delete-account pages bypass onboarding and the desktop blocker so store reviewers and former users can access them without an account.
- Deletion requests currently use the existing support email; do not present email initiation as completed account deletion or store-compliant automated deletion.
