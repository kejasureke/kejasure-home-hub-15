export const MAX_PENDING_VIEWINGS = 3;

export function pendingViewingCount(bookings: ReadonlyArray<{ kind: string; status: string }>): number {
  return bookings.filter((booking) => booking.kind === "viewing" && booking.status === "pending").length;
}

export function canRequestViewing(bookings: ReadonlyArray<{ kind: string; status: string }>): boolean {
  return pendingViewingCount(bookings) < MAX_PENDING_VIEWINGS;
}