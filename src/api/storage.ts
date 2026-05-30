import { createServerFn } from "@tanstack/react-start";

const BUCKET = "Agatike";
const SUPABASE_URL = "https://mrcsteggkqkpeyrjnxcb.supabase.co";

/**
 * Server-side file upload to Supabase Storage using the REST API directly.
 * This bypasses the Supabase JS client and posts directly to the storage endpoint
 * using the anon key, which works as long as the bucket has public RLS policies.
 * 
 * If uploads still fail with 400, go to Supabase Dashboard → Storage → Policies
 * and add an INSERT policy for the anon role on the Agatike bucket.
 */
export const uploadFile = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { base64, contentType, folder, ext } = ctx.data as unknown as {
      base64: string;
      contentType: string;
      folder: string;
      ext: string;
    };

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.VITE_SUPABASE_ANOM_KEY;

    // Use service role key if properly configured, otherwise fall back to anon key
    const isServiceKeyValid =
      serviceKey &&
      serviceKey !== "YOUR_SERVICE_ROLE_KEY_HERE" &&
      serviceKey.startsWith("eyJ");

    const authKey = isServiceKeyValid ? serviceKey : anonKey;

    if (!authKey) {
      throw new Error("Supabase credentials not configured in .env");
    }

    const filename = `${folder}/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;

    // Decode base64 → binary buffer
    const binaryData = Buffer.from(base64, "base64");

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authKey}`,
        "Content-Type": contentType,
        "Cache-Control": "3600",
        "x-upsert": "true",
      },
      body: binaryData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed (${response.status}): ${errText}`);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
    return { url: publicUrl };
  }
  );
