import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as { id: string; business_id: string; role: UserRole; full_name: string; email: string } | null;
}

export function canViewRevenue(role: UserRole): boolean {
  return role === "super_admin" || role === "owner" || role === "admin";
}

export function canManageEmployees(role: UserRole): boolean {
  return role === "super_admin" || role === "owner" || role === "admin";
}

export function canManageServices(role: UserRole): boolean {
  return role === "super_admin" || role === "owner" || role === "admin";
}

export function canManageSettings(role: UserRole): boolean {
  return role === "super_admin" || role === "owner";
}
