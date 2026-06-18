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
export const uploadFile = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { base64, contentType, folder, ext } = ctx.data as unknown as {
    base64: string;
    contentType: string;
    folder: string;
    ext: string;
  };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANOM_KEY;

  // Use service role key if properly configured, otherwise fall back to anon key
  const isServiceKeyValid =
    serviceKey && serviceKey !== "YOUR_SERVICE_ROLE_KEY_HERE" && serviceKey.startsWith("eyJ");

  const authKey = isServiceKeyValid ? serviceKey : anonKey;

  if (!authKey) {
    throw new Error("Supabase credentials not configured in .env");
  }

  const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

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
});

/**
 * Server-side file upload using standard FormData.
 * This accepts a raw File object and passes it to Supabase via the REST API,
 * bypassing RLS policies by using the service key.
 */
export const uploadFormData = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
  const formData = ctx.data as unknown as FormData;
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "uploads";
  
  if (!file) throw new Error("No file provided");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANOM_KEY;
  const isServiceKeyValid =
    serviceKey && serviceKey !== "YOUR_SERVICE_ROLE_KEY_HERE" && serviceKey.startsWith("eyJ");
  const authKey = isServiceKeyValid ? serviceKey : anonKey;

  if (!authKey) throw new Error("Supabase credentials not configured in .env");

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;

  const arrayBuffer = await file.arrayBuffer();
  const binaryData = Buffer.from(arrayBuffer);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authKey}`,
      "Content-Type": file.type || "application/octet-stream",
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
});

/**
 * Server-side bulk file deletion from Supabase Storage.
 * Accepts an array of full public URLs and deletes each one.
 */
export const deleteFiles = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
  const { urls } = ctx.data as unknown as { urls: string[] };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANOM_KEY;
  const isServiceKeyValid =
    serviceKey && serviceKey !== "YOUR_SERVICE_ROLE_KEY_HERE" && serviceKey.startsWith("eyJ");
  const authKey = isServiceKeyValid ? serviceKey : anonKey;

  if (!authKey) throw new Error("Supabase credentials not configured in .env");

  const PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

  // Extract storage paths from full public URLs and filter to only files in our bucket
  const paths = urls.filter((u) => u && u.startsWith(PREFIX)).map((u) => u.replace(PREFIX, ""));

  if (paths.length === 0) return { deleted: 0 };

  // Supabase Storage bulk delete endpoint
  const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}`;
  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: paths }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Storage deletion failed (${response.status}): ${errText}`);
    // Don't throw — still proceed with DB deletion
  }

  return { deleted: paths.length };
});
