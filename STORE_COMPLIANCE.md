# KejaSure store-readiness checklist

Reviewed 29 October 2026. This is not a certification or a guarantee of approval.

## Fixed in the app
- Privacy Policy and Terms are accessible in Settings, not only signup.
- Signup and Settings share policy text, avoiding contradictory disclosures.
- Public `/privacy`, `/terms` and `/delete-account` pages work without onboarding, sign-in or a mobile browser. Use the published origin `https://kejasureapp.lovable.app` when entering store URLs after publishing.
- The inactive deletion-confirmation button now opens clear deletion-request instructions and an email action; it no longer pretends to delete an account.
- Removed misleading privacy claims that identity checks retain only a reference or that location is used only on the map.
- Aligned subscription-only payment wording and removed conflicting blanket refund promises from signup/support.
- Public privacy → deletion navigation checked at phone and desktop sizes: no page errors or horizontal overflow.

## Approval blockers / not completed
1. **Actual account deletion:** no implemented account/data deletion service was found. The email link opens a request; it does not process deletion. Support must have an operational, verified process with identity checks, timing, deletion of associated data and disclosed retention exceptions. Apple generally expects direct in-app initiation; email-only handling should not be presumed acceptable. Full deletion is outside this frontend-only change.
2. **Store billing:** tenant passes and provider plans unlock digital app features. M-Pesa does not automatically qualify for an exception to Apple In-App Purchase / Google Play Billing in Kenya. Existing billing was left unchanged; resolve store billing or obtain applicable store guidance before submission. Do not relabel digital access as physical rent to evade billing rules.
3. **UGC safety:** listing reports only show a local success state, chat reporting is not wired, and user blocking is absent. Real report submission, enforced blocking and an operational moderation process are needed; these cannot be fixed by visual changes alone.
4. **Owner-approved privacy information:** confirm the legal entity, monitored support/privacy contact, data retention periods, international processing, processor agreements, rights request handling and exact SDK/AI data collection. The policy text is a draft disclosure, not proof of compliance. The existing support email was reused, not verified.
5. **Store console declarations:** Apple privacy labels, Google Data Safety and deletion URL declarations must match actual data processing and SDK behavior. Console access was not available for this review.
6. **Native permissions/build:** inspect the actual Despia iOS/Android packages, purpose strings, SDK privacy manifests, Android target SDK and photo-picker permissions. Request only needed permissions in context; avoid broad SMS reading/storage access for autofill. None of these native-package settings were verified.
7. **Reviewer access:** supply a legitimate review account and instructions that do not depend on reviewers receiving a Kenyan OTP or making a real M-Pesa payment. Do not add hidden production authentication bypasses.
8. **Website/store alignment:** use consistent branding, subscriptions-only payments, support contacts and policy URLs on the separate marketing site and store listing. That separate project was not changed or verified.
9. **Honest production content:** sample listings, trust badges and locally simulated Settings controls remain. Do not submit unsupported verification/safety claims or advertise controls as enforced when they only change the screen.
10. **WebView quality:** check the real devices for swipe navigation, status-bar safe areas, offline recovery, camera, biometric fallback, notification routing and crashes. Native features add value but do not guarantee Apple minimum-functionality approval.

## Official references
- Apple App Review Guidelines (1.2 UGC, 3.1.1 purchases, 4.2 minimum functionality, 5.1.1 privacy/account deletion): https://developer.apple.com/app-store/review/guidelines/
- Apple account deletion guidance: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Google User Data: https://support.google.com/googleplay/android-developer/answer/10144311
- Google account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Payments: https://support.google.com/googleplay/android-developer/answer/9858738
- Google UGC: https://support.google.com/googleplay/android-developer/answer/9876937

Policies and regional exceptions can change; recheck the official text at submission.