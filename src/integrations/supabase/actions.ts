import { supabase } from "./client";

export type UpsertProfileArgs = {
  phone?: string | null;
  role?: string | null;
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
  plan_name?: string | null;
};

export type CreateSubscriptionArgs = {
  plan_id?: string | null;
  plan_name: string;
  role: string;
  price: number;
  duration: string;
  auto_renew?: boolean;
  currency?: string;
  metadata?: Record<string, unknown> | null;
};

export type CreatePaymentArgs = {
  subscription_id?: string | null;
  listing_id?: string | null;
  amount: number;
  currency?: string;
  method: string;
  status?: string | null;
  transaction_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const upsertProfile = async (args: UpsertProfileArgs) => {
  return supabase.rpc("upsert_profile" as never, args as never);
};

export const createSubscription = async (args: CreateSubscriptionArgs) => {
  return supabase.rpc("create_subscription" as never, args as never);
};

export const recordPayment = async (args: CreatePaymentArgs) => {
  return supabase.rpc("create_payment" as never, args as never);
};
