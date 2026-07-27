/**
 * Augment OpenNext CloudflareEnv with this project's Worker vars/secrets.
 * Keep in sync with .env.example and Cloudflare Dashboard bindings.
 */
declare global {
  interface CloudflareEnv {
    ADMIN_API_KEY?: string;

    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;

    R2_ACCOUNT_ID?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    R2_BUCKET_NAME?: string;
    R2_PUBLIC_URL?: string;

    NEXT_PUBLIC_FANCLUB_URL?: string;
    NEXT_PUBLIC_ACADEMY_URL?: string;
    NEXT_PUBLIC_SHOP_URL?: string;

    ROOT_DOMAIN?: string;
    NEXT_PUBLIC_ROOT_DOMAIN?: string;
    REF_SUBDOMAIN_MAP?: string;

    ALLOW_MOCK_DATA?: string;
  }
}

export {};
