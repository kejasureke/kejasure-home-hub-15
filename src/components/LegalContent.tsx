import { Button } from "@/components/ui/button";

export type LegalDocument = "privacy" | "terms" | "delete-account";

export const legalTitles: Record<LegalDocument, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  "delete-account": "Delete your KejaSure account",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="font-semibold text-foreground">{title}</h2>
    <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

export default function LegalContent({ document }: { document: LegalDocument }) {
  if (document === "delete-account") return (
    <div className="space-y-6">
      <Section title="Request permanent deletion">
        <p>You can request deletion without installing KejaSure or signing in. Email our support team with the phone number registered to your account. Never include your PIN, an SMS code or an ID photo. We will need to verify that the account belongs to you before deleting it.</p>
      </Section>
      <Section title="What your request covers">
        <p>Ask to delete your account and associated personal data, including your profile, listings, messages, saved homes, alerts and identity-verification information. Deleting the app from your phone does not delete your account.</p>
      </Section>
      <Section title="Records and subscriptions">
        <p>Ask support to explain any records that must be retained, the reason and the retention period before processing your request. Payment, fraud or legal records may need separate handling. A deletion request does not itself cancel or refund a paid subscription.</p>
      </Section>
      <Button asChild className="w-full h-auto min-h-11 whitespace-normal">
        <a href="mailto:support@kejasure.ke?subject=KejaSure%20account%20deletion%20request&body=Please%20delete%20my%20KejaSure%20account%20and%20associated%20personal%20data.%0ARegistered%20phone%20number%3A%20%0APlease%20confirm%20identity%20verification%20steps%2C%20processing%20time%20and%20any%20records%20you%20must%20retain.">Email deletion request</a>
      </Button>
      <p className="text-xs text-muted-foreground break-words">support@kejasure.ke · Opening an email does not submit your request; send it from your email app.</p>
    </div>
  );
  if (document === "terms") return (
    <div className="space-y-6">
      <Section title="1. What KejaSure does"><p>KejaSure connects tenants and guests with landlords, hosts, agencies and home service providers across Kenya. Any property or service agreement is between you and the other party.</p></Section>
      <Section title="2. Connection-only marketplace"><p>KejaSure does not collect or hold rent, deposits, viewing fees or payments for providers’ services. Inspect the property or service and confirm the other party before agreeing to payment directly with them.</p></Section>
      <Section title="3. Your account"><p>Your phone number is verified by SMS at signup and protected by your 4-digit PIN. Keep your PIN and verification codes private.</p></Section>
      <Section title="4. Honest listings"><p>Listings must be real, currently available and use your own photos. Fake, duplicated or misleading listings may be removed and the account may be suspended.</p></Section>
      <Section title="5. Subscriptions"><p>Paid plans unlock platform features and listing slots. Subscription fees are the only payments KejaSure charges. Review the price and access period before paying. Contact Help &amp; Support about payment or refund issues; any applicable consumer rights still apply.</p></Section>
      <Section title="6. Conduct"><p>No harassment, discrimination, spam, scams, scraping or attempts to break the app’s security. Do not publish personal information without permission.</p></Section>
      <Section title="7. Reports and disputes"><p>Report suspicious users or listings in the app. Accounts may be suspended during investigation. Identity records may be shared with authorities where legally required. Verification is not a guarantee of a property or person’s conduct.</p></Section>
      <Section title="Contact"><p>Use Help &amp; Support in the app or email support@kejasure.ke.</p></Section>
    </div>
  );
  return (
    <div className="space-y-6">
      <Section title="KejaSure and your information"><p>This notice covers the KejaSure app and its web experience. For privacy questions, access, correction or deletion requests, contact support@kejasure.ke.</p></Section>
      <Section title="Account and activity"><p>Information used by KejaSure includes your real name, phone number, role, profile preferences, listings, photos, messages, booking requests, saved homes, alerts and reports. Device and security information helps protect account access and investigate misuse.</p></Section>
      <Section title="Identity checks"><p>Verification can involve an ID or passport, selfie or liveness check, and business documents, depending on your role. Smile ID processes verification information. Verification submissions, uploaded documents, results and references can be stored; they are not ordinary public profile content.</p></Section>
      <Section title="Location, camera and photos"><p>With your permission, location helps with nearby discovery, maps and confirming a listing’s GPS pin. Camera and photo access lets you upload listing, profile or verification images. Listing photos may contain location metadata used for integrity checks. You can decline a permission and use features that do not need it, or change permissions in your phone’s settings.</p></Section>
      <Section title="Payments and notifications"><p>M-Pesa is used for KejaSure platform subscriptions, not rent, deposits or service payments. Subscription records can include your payment phone number, amount, receipt reference, status and access period. SMS verifies account access; notification information supports messages, bookings and listing alerts.</p></Section>
      <Section title="Who receives information"><p>Service providers supporting KejaSure include Smile ID for identity checks, Africa’s Talking for SMS, M-Pesa for subscription payments, Lovable Cloud for hosting and account data, and Despia and OneSignal for native-app and notification features. Listing-image integrity checks can send images to an AI service for analysis. Other members see information you publish, such as your name, listing photos and verification badges; phone contacts are locked until a booking is accepted.</p></Section>
      <Section title="Safety checks"><p>Photo-integrity and scam-risk signals help identify suspicious content, but can be wrong. Report a concern or ask Help &amp; Support for human review rather than treating a score as proof.</p></Section>
      <Section title="Information on your phone"><p>KejaSure uses local storage for app preferences and saved state. Saved-home images and app files may be cached for offline access. Uninstalling the app is not an account-deletion request.</p></Section>
      <Section title="Your choices and deletion"><p>You may request access, correction or deletion through Help &amp; Support. Use Settings → Account → Delete Account for deletion instructions, or open the public account-deletion page. Ask support for the applicable retention periods and any payment, fraud or legal records that must be retained.</p></Section>
      <Button asChild variant="outline" className="w-full"><a href="/delete-account">Account deletion options</a></Button>
    </div>
  );
}