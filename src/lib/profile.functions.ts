import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(
        "id, full_name, phone, age, gender, state, city, current_education, preferred_language",
      )
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  });
