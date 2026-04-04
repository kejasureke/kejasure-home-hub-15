
# KejaSure Onboarding & Registration Flow

Since we're doing **UI mockups first** (no backend yet), all screens will use local state and localStorage for persistence.

## Phase 1: Welcome Screens (Swipeable carousel)
3 premium slides with illustrations:
1. **"Verified Landlords, Zero Scams"** — trust messaging + shield icon
2. **"Secure M-Pesa Payments"** — payment security + 47 counties
3. **"Find Your Next Keja"** — CTA slide with "Get Started" button

## Phase 2: Role Selection Screen
Single screen with 5 role cards:
- Tenant, Landlord, Agency, Stay Host, Service Provider
- Each with icon, title, subtitle
- Selection proceeds to auth flow

## Phase 3: Auth Flow (5 screens)
1. **Phone Input** — +254 prefix, Kenyan number format validation
2. **OTP Verification** — 6-digit code input with resend timer
3. **PIN Creation** — 4-digit secure PIN
4. **PIN Confirmation** — re-enter PIN
5. **Biometric Prompt** — optional fingerprint/face unlock setup + "Remember this device"

## Phase 4: Role-Specific Profile Setup
Each role gets a multi-step form:

**Tenant** (3 steps): Location prefs → Budget & rooms → Service interests
**Landlord** (3 steps): ID & KRA verification → Ownership proof → Plan selection
**Agency** (3 steps): Business docs → Agency details → Plan selection
**Stay Host** (3 steps): Host verification → First stay setup → Plan selection
**Service Provider** (3 steps): Type & category → Coverage & portfolio → Plan selection

## Technical Approach
- Single `OnboardingFlow.tsx` orchestrator component
- Separate component per screen group
- Progress indicator throughout
- All mock/localStorage — ready for Lovable Cloud later
- Consistent green trust palette + gold accents

**Total: ~15 screens, built as focused components**
