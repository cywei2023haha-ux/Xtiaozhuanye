const ADMIN_KEY_STORAGE = "stand_archive_admin_key";

export function getStoredAdminKey(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_KEY_STORAGE);
}

export function setStoredAdminKey(key: string) {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function clearStoredAdminKey() {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE);
}

export function adminHeaders(): HeadersInit {
  const key = getStoredAdminKey();
  if (!key) return {};
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const key = getStoredAdminKey();
  if (key) headers.set("Authorization", `Bearer ${key}`);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
