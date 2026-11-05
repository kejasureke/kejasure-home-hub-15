# Make viewing requests work again

## Problem
Viewing and stay requests now only go through for homes that are really published on KejaSure. But the app only shows sample homes and homes saved on the landlord's phone, so every request is blocked.

## What to build
1. **Show real published homes** on the Home feed, Explore, Map, AI Match and Scam Check, first in each list, with grey loading shapes while they load.
2. **Make Add Listing publish for real**, so new homes go live for everyone, trigger listing alerts, and can take viewing requests. Drafts stay on the phone.
3. **Sample homes stay as examples.** They get a small "Sample home" label, and their request button says "Sample listing — requests open on live homes" instead of letting the tenant fill in the form and then showing an error.
4. **Keep the server checks as they are:** an active plan, at most three pending requests, and only the landlord can accept.

## Technical details
- Add a `useLiveListings` hook that reads active `listings` rows (with their first photo) and turns them into the app's `Property` shape.
- In ListingCRUD, insert or update the listing row and upload photos to listing media; drafts stay saved on the phone.
- In BookingRequestModal, check whether the home is live before the form opens, so tenants never fill it in only to be refused.
