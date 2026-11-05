export interface SubscriptionWindow {
  status: string;
  starts_at: string | null;
  ends_at: string | null;
}

export function isActiveSubscription(subscription: SubscriptionWindow, now = Date.now()): boolean {
  const start = subscription.starts_at ? Date.parse(subscription.starts_at) : 0;
  const end = subscription.ends_at ? Date.parse(subscription.ends_at) : NaN;
  return subscription.status === "active" && start <= now && end > now;
}

/** Tenants are free; contacts unlock only after the provider accepts the booking. */
export function canRevealContact(bookingStatus?: string): boolean {
  return (bookingStatus === "accepted" || bookingStatus === "completed");
}