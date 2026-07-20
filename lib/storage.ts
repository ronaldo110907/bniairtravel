import { supabase } from "./supabase";

export function getStorageUrl(path: string) {
  return supabase.storage
    .from("gallery")
    .getPublicUrl(path).data.publicUrl;
}