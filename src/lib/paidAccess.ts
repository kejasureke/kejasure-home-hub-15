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

export function canRevealContact(hasActivePlan: boolean, bookingStatus?: string): boolean {
  return hasActivePlan && (bookingStatus === "accepted" || bookingStatus === "completed");
}