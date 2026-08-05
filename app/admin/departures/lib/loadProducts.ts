import { supabase } from "@/lib/supabase";

export async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, title")
    .order("title");

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}