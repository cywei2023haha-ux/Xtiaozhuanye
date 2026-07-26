/** Browser PUT to presigned R2 URL (requires bucket CORS — see npm run r2:cors). */
export async function uploadFileToR2(
  uploadUrl: string,
  file: File,
): Promise<void> {
  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!res.ok) {
      throw new Error(`R2 upload failed (HTTP ${res.status})`);
    }
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(
        "Browser blocked R2 upload (CORS). Run once: npm run r2:cors — then retry.",
      );
    }
    throw err;
  }
}
