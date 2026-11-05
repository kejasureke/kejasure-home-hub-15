import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/data/mockData";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** A home is "live" (can receive real requests) only when it exists as a published account listing. */
export const isLiveListingId = (id: string) => UUID_RE.test(id);

const EVENT = "live-listings-updated";
let cache: Property[] | null = null;
let inflight: Promise<Property[]> | null = null;

const segmentToType = (s: string): Property["type"] =>
  s === "short_stay" ? "shortstay" : s === "commercial" ? "commercial" : "rental";

async function load(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(url, sort_order)")
    .eq("status", "active")
    .neq("segment", "service")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return cache ?? [];
  const paths = data.flatMap((l: any) => (l.listing_images ?? []).map((i: any) => i.url as string));
  const signed: Record<string, string> = {};
  if (paths.length) {
    const { data: urls } = await supabase.storage.from("listing-media").createSignedUrls(paths, 60 * 60 * 6);
    urls?.forEach((u) => { if (u.path && u.signedUrl) signed[u.path] = u.signedUrl; });
  }
  return data.map((l: any): Property => {
    const imgs = [...(l.listing_images ?? [])]
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((i: any) => signed[i.url] || i.url)
      .filter(Boolean);
    const rules = (l.rules ?? {}) as any;
    return {
      id: l.id,
      title: l.title,
      type: segmentToType(l.segment),
      corporate: l.segment === "corporate",
      county: l.county ?? "",
      subcounty: l.subcounty ?? "",
      ward: l.ward ?? "",
      estate: l.estate ?? "",
      price: Number(l.price_kes) || 0,
      priceUnit: l.price_unit === "night" ? "/night" : "/mo",
      bedrooms: l.bedrooms ?? 0,
      bathrooms: l.bathrooms ?? 0,
      image: imgs[0] ?? "",
      images: imgs,
      verified: l.verification === "verified",
      featured: !!l.boost_expires_at && new Date(l.boost_expires_at) > new Date(),
      available: true,
      amenities: Array.isArray(l.amenities) ? l.amenities : [],
      landlordResponseTime: "—",
      landlordResponseSpeed: "moderate",
      lastActive: "—",
      nearbyLandmarks: l.landmark ? [l.landmark] : [],
      description: l.description ?? "",
      lat: Number(l.lat) || 0,
      lng: Number(l.lng) || 0,
      furnished: !!rules.furnished,
      petFriendly: !!rules.petFriendly,
      homeDetails: rules.homeDetails,
    };
  });
}

export function refreshLiveListings() {
  inflight = load().then((r) => { cache = r; inflight = null; window.dispatchEvent(new Event(EVENT)); return r; });
  return inflight;
}

/** Published homes from every provider account, newest first. */
export function useLiveListings() {
  const [list, setList] = useState<Property[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  useEffect(() => {
    const sync = () => { setList(cache ?? []); setLoading(false); };
    window.addEventListener(EVENT, sync);
    if (cache === null && !inflight) refreshLiveListings();
    else if (cache !== null) sync();
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return { liveListings: list, loading };
}

const dataUrlToBlob = async (u: string) => (await fetch(u)).blob();

/** Publish (or update) a provider's listing to their account so every renter can see and request it. */
export async function publishListing(input: {
  existingId?: string;
  segment: "rental" | "short_stay" | "commercial" | "corporate";
  title: string; description: string; price: number; priceUnit: "month" | "night";
  bedrooms: number; bathrooms: number; county: string; subcounty: string; estate: string;
  lat?: number; lng?: number; amenities: string[]; rules: Record<string, unknown>;
  photos: string[];
}): Promise<{ id?: string; error?: string }> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { error: "Sign in to publish your listing." };
  const row = {
    owner_id: uid, segment: input.segment, title: input.title || "Untitled home",
    description: input.description, price_kes: input.price, price_unit: input.priceUnit,
    bedrooms: input.bedrooms, bathrooms: input.bathrooms, county: input.county,
    subcounty: input.subcounty, estate: input.estate, lat: input.lat || null, lng: input.lng || null,
    amenities: input.amenities as any, rules: input.rules as any, status: "active" as const,
  };
  const isUpdate = input.existingId && isLiveListingId(input.existingId);
  const res = isUpdate
    ? await supabase.from("listings").update(row).eq("id", input.existingId!).select("id").single()
    : await supabase.from("listings").insert(row).select("id").single();
  if (res.error || !res.data) return { error: res.error?.message || "Couldn't publish your listing." };
  const id = res.data.id as string;

  const newPhotos = input.photos.filter((p) => p.startsWith("data:"));
  if (newPhotos.length) {
    const rows: { listing_id: string; url: string; sort_order: number; is_cover: boolean }[] = [];
    for (let i = 0; i < newPhotos.length; i++) {
      try {
        const blob = await dataUrlToBlob(newPhotos[i]);
        const path = `${uid}/${id}/${Date.now()}_${i}.${blob.type.split("/")[1] || "jpg"}`;
        const up = await supabase.storage.from("listing-media").upload(path, blob, { contentType: blob.type });
        if (!up.error) rows.push({ listing_id: id, url: path, sort_order: i, is_cover: i === 0 && !isUpdate });
      } catch { /* skip unreadable photo */ }
    }
    if (rows.length) await supabase.from("listing_images").insert(rows);
  }
  refreshLiveListings();
  return { id };
}
