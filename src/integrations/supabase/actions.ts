import { supabase } from "./client";
import type { Database } from "./types";

export type UpsertProfileArgs = {
  phone?: string | null;
  role?: Database["public"]["Tables"]["profiles"]["Row"]["role"];
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  avatar?: string | null;
  agency_name?: string | null;
  service_category?: string | null;
  preferred_counties?: string[] | null;
  budget_range?: string | null;
  property_count?: string | null;
  stay_type?: string | null;
  bio?: string | null;
};

export type CreateSubscriptionArgs = {
  plan_id?: string | null;
  plan_name: string;
  role: Database["public"]["Tables"]["subscriptions"]["Row"]["role"];
  price: number;
  duration: string;
  auto_renew?: boolean;
  currency?: string;
  metadata?: Database["public"]["Tables"]["subscriptions"]["Row"]["metadata"];
};

export type CreatePaymentArgs = {
  subscription_id?: string | null;
  listing_id?: string | null;
  amount: number;
  currency?: string;
  method: string;
  status?: Database["public"]["Tables"]["payments"]["Row"]["status"];
  transaction_id?: string | null;
  metadata?: Database["public"]["Tables"]["payments"]["Row"]["metadata"];
};

export const upsertProfile = async (args: UpsertProfileArgs) => {
  return supabase.rpc("upsert_profile", args);
};

export const createSubscription = async (args: CreateSubscriptionArgs) => {
  return supabase.rpc("create_subscription", args);
};

export const recordPayment = async (args: CreatePaymentArgs) => {
  return supabase.rpc("create_payment", args);
};
