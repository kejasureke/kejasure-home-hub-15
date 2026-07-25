/**
 * Typed backend helpers — thin wrappers over the Supabase client so
 * components don't need to know about SQL details. Import as:
 *   import { backend } from "@/lib/backend";
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

// ---------- Profile ----------
export const profileApi = {
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return data;
  },
  async update(patch: Partial<Tables["profiles"]["Update"]>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("profiles").update(patch).eq("id", user.id).select().single();
  },
};

// ---------- Roles ----------
export const rolesApi = {
  async list(userId: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    return (data ?? []).map((r) => r.role);
  },
  async add(role: Database["public"]["Enums"]["app_role"]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("user_roles").upsert({ user_id: user.id, role }, { onConflict: "user_id,role" });
  },
};

// ---------- Listings ----------
export const listingsApi = {
  async list(filters?: {
    segment?: Database["public"]["Enums"]["listing_segment"];
    county?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  }) {
    let q = supabase
      .from("listings")
      .select("*, listing_images(url, is_cover, sort_order)")
      .eq("status", "active")
      .order("boost_expires_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (filters?.segment) q = q.eq("segment", filters.segment);
    if (filters?.county) q = q.eq("county", filters.county);
    if (filters?.minPrice != null) q = q.gte("price_kes", filters.minPrice);
    if (filters?.maxPrice != null) q = q.lte("price_kes", filters.maxPrice);
    if (filters?.limit) q = q.limit(filters.limit);
    return q;
  },
  get: (id: string) =>
    supabase
      .from("listings")
      .select("*, listing_images(*), listing_videos(*)")
      .eq("id", id)
      .maybeSingle(),
  create: (row: Tables["listings"]["Insert"]) =>
    supabase.from("listings").insert(row).select().single(),
  update: (id: string, patch: Tables["listings"]["Update"]) =>
    supabase.from("listings").update(patch).eq("id", id).select().single(),
  remove: (id: string) => supabase.from("listings").delete().eq("id", id),
  incrementView: async (id: string) => {
    await supabase.from("recently_viewed").upsert(
      { user_id: (await supabase.auth.getUser()).data.user?.id!, listing_id: id, viewed_at: new Date().toISOString() },
      { onConflict: "user_id,listing_id" },
    );
  },
};

// ---------- Favorites ----------
export const favoritesApi = {
  async list() {
    const { data } = await supabase.from("saved_listings").select("listing_id");
    return (data ?? []).map((r) => r.listing_id);
  },
  add: async (listingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    return supabase.from("saved_listings").insert({ user_id: user.id, listing_id: listingId });
  },
  remove: (listingId: string) =>
    supabase.from("saved_listings").delete().eq("listing_id", listingId),
};

// ---------- Saved searches ----------
export const savedSearchesApi = {
  list: () => supabase.from("saved_searches").select("*").order("created_at", { ascending: false }),
  create: async (name: string, filters: Record<string, unknown>, notify = true) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("saved_searches").insert({ user_id: user.id, name, filters: filters as never, notify }).select().single();
  },
  remove: (id: string) => supabase.from("saved_searches").delete().eq("id", id),
};

// ---------- Price alerts ----------
export const priceAlertsApi = {
  list: () => supabase.from("price_alerts").select("*, listings(*)"),
  add: async (listingId: string, thresholdKes?: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("price_alerts").upsert(
      { user_id: user.id, listing_id: listingId, threshold_kes: thresholdKes ?? null },
      { onConflict: "user_id,listing_id" },
    );
  },
  remove: (listingId: string) =>
    supabase.from("price_alerts").delete().eq("listing_id", listingId),
};

// ---------- Recently viewed ----------
export const recentsApi = {
  list: (limit = 10) =>
    supabase
      .from("recently_viewed")
      .select("listing_id, viewed_at, listings(*)")
      .order("viewed_at", { ascending: false })
      .limit(limit),
};

// ---------- Bookings ----------
export const bookingsApi = {
  listMine: () => supabase.from("bookings").select("*, listings(*)").order("created_at", { ascending: false }),
  listAsHost: () => supabase.from("bookings").select("*, listings(*)").order("created_at", { ascending: false }),
  create: async (row: Omit<Tables["bookings"]["Insert"], "guest_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("bookings").insert({ ...row, guest_id: user.id }).select().single();
  },
  updateStatus: (id: string, status: Tables["bookings"]["Update"]["status"]) =>
    supabase.from("bookings").update({ status }).eq("id", id).select().single(),
  events: (bookingId: string) =>
    supabase.from("booking_events").select("*").eq("booking_id", bookingId).order("created_at"),
};

// ---------- Chat ----------
export const chatApi = {
  listConversations: () =>
    supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: false }),
  getOrCreate: async (otherUserId: string, listingId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const [a, b] = [user.id, otherUserId].sort();
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("participant_a", a)
      .eq("participant_b", b)
      .maybeSingle();
    if (existing) return existing;
    const { data } = await supabase
      .from("conversations")
      .insert({ participant_a: a, participant_b: b, listing_id: listingId ?? null })
      .select()
      .single();
    return data!;
  },
  messages: (conversationId: string) =>
    supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at"),
  send: async (conversationId: string, body: string, attachmentUrl?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
      attachment_url: attachmentUrl ?? null,
    });
  },
  markRead: (messageId: string) =>
    supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", messageId),
  subscribe: (conversationId: string, onInsert: (msg: Tables["messages"]["Row"]) => void) => {
    const ch = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (p) => onInsert(p.new as Tables["messages"]["Row"]),
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  },
};

// ---------- Notifications ----------
export const notificationsApi = {
  list: (limit = 50) =>
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit),
  markRead: (id: string) =>
    supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id),
  markAllRead: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    return supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  },
  subscribe: (userId: string, onInsert: (n: Tables["notifications"]["Row"]) => void) => {
    const ch = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (p) => onInsert(p.new as Tables["notifications"]["Row"]),
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  },
};

// ---------- Subscriptions & boosts ----------
export const billingApi = {
  plans: (role?: Database["public"]["Enums"]["app_role"]) => {
    let q = supabase.from("subscription_plans").select("*").eq("active", true).order("sort_order");
    if (role) q = q.eq("role", role);
    return q;
  },
  mySubscription: () =>
    supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("status", "active")
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  subscribe: async (planId: string, mpesaReceipt?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const starts = new Date();
    const ends = new Date();
    ends.setMonth(ends.getMonth() + 1);
    return supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      status: "active",
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      mpesa_receipt: mpesaReceipt ?? null,
    });
  },
  boost: async (listingId: string, pkg: string, priceKes: number, days: number, mpesaReceipt?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    await supabase.from("boost_purchases").insert({
      listing_id: listingId,
      user_id: user.id,
      package: pkg,
      price_kes: priceKes,
      expires_at: expires.toISOString(),
      mpesa_receipt: mpesaReceipt ?? null,
    });
    await supabase.from("listings").update({ boost_expires_at: expires.toISOString() }).eq("id", listingId);
  },
};

// ---------- Reviews ----------
export const reviewsApi = {
  forTarget: (type: Database["public"]["Enums"]["review_target"], targetId: string) =>
    supabase
      .from("reviews")
      .select("*, profiles!reviewer_id(full_name, avatar_url)")
      .eq("target_type", type)
      .eq("target_id", targetId)
      .order("created_at", { ascending: false }),
  create: async (type: Database["public"]["Enums"]["review_target"], targetId: string, rating: number, body?: string, photos: string[] = []) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("reviews").insert({
      reviewer_id: user.id,
      target_type: type,
      target_id: targetId,
      rating,
      body: body ?? null,
      photos,
    });
  },
  toggleHelpful: async (reviewId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const { data: existing } = await supabase
      .from("review_helpful")
      .select("review_id")
      .eq("review_id", reviewId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      return supabase.from("review_helpful").delete().eq("review_id", reviewId).eq("user_id", user.id);
    }
    return supabase.from("review_helpful").insert({ review_id: reviewId, user_id: user.id });
  },
};

// ---------- KYC ----------
export const kycApi = {
  latest: () =>
    supabase.from("kyc_submissions").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  submit: async (payload: Omit<Tables["kyc_submissions"]["Insert"], "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("kyc_submissions").insert({ ...payload, user_id: user.id }).select().single();
  },
};

// ---------- Reports & disputes ----------
export const trustApi = {
  report: async (target: Database["public"]["Enums"]["report_target"], targetId: string, reason: string, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: target,
      target_id: targetId,
      reason,
      notes: notes ?? null,
    });
  },
  openDispute: async (bookingId: string, category: string, description?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return supabase.from("disputes").insert({
      booking_id: bookingId,
      opener_id: user.id,
      category,
      description: description ?? null,
    });
  },
};

// ---------- Storage ----------
export const storageApi = {
  uploadAvatar: async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  },
  uploadListingMedia: async (listingId: string, file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const path = `${user.id}/${listingId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("listing-media").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("listing-media").getPublicUrl(path);
    return data.publicUrl;
  },
  uploadKyc: async (file: File, kind: "selfie" | "id" | "business") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const path = `${user.id}/${kind}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("kyc-docs").upload(path, file);
    if (error) throw error;
    // private bucket: caller signs URL when needed
    return path;
  },
  signedKycUrl: async (path: string, expiresIn = 60) => {
    const { data } = await supabase.storage.from("kyc-docs").createSignedUrl(path, expiresIn);
    return data?.signedUrl ?? null;
  },
};

export const backend = {
  profile: profileApi,
  roles: rolesApi,
  listings: listingsApi,
  favorites: favoritesApi,
  savedSearches: savedSearchesApi,
  priceAlerts: priceAlertsApi,
  recents: recentsApi,
  bookings: bookingsApi,
  chat: chatApi,
  notifications: notificationsApi,
  billing: billingApi,
  reviews: reviewsApi,
  kyc: kycApi,
  trust: trustApi,
  storage: storageApi,
};
