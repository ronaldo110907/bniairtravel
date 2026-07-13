import { supabase } from "@./supabase";
import { Product } from "@../types/product";

export async function getProduct(slug: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return data;
}