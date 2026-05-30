import { uploadFile } from "@/api/storage";

/**
 * Uploads a File via the server-side Supabase service-role uploader.
 * @param file   - The File object selected by the user
 * @param folder - Destination folder, e.g. "events/covers" or "events/merch"
 */
export async function uploadFileToStorage(
  file: File,
  folder: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const contentType = file.type || "image/jpeg";

  // Convert File → base64 string so it can cross the client→server boundary
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<type>;base64,<data>" — strip the prefix
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const { url } = await uploadFile({ data: { base64, contentType, folder, ext } } as any);
  return url;
}
