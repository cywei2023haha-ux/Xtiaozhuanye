"use client";

import {
  clearStoredAdminKey,
  getStoredAdminKey,
  setStoredAdminKey,
} from "@/lib/admin-client";
import { type ReactNode, useEffect, useState } from "react";

type AdminAuthGateProps = {
  children: ReactNode;
};

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [key, setKey] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setKey(getStoredAdminKey());
    setHydrated(true);
  }, []);

  const verifyKey = async () => {
    setChecking(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/images", {
        headers: { Authorization: `Bearer ${input}` },
      });

      if (res.status === 401) {
        setError("Invalid admin key");
        return;
      }

      if (res.status === 503) {
        setError("Server not configured. Set ADMIN_API_KEY and Supabase env vars.");
        return;
      }

      if (!res.ok) {
        setError("Authentication failed");
        return;
      }

      setStoredAdminKey(input);
      setKey(input);
    } catch {
      setError("Network error");
    } finally {
      setChecking(false);
    }
  };

  const logout = () => {
    clearStoredAdminKey();
    setKey(null);
    setInput("");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] text-white">
        <p className="text-sm font-black uppercase tracking-widest">Loading…</p>
      </div>
    );
  }

  if (!key) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] p-6">
        <div className="w-full max-w-md border-4 border-black bg-jojo-yellow p-8 shadow-[8px_8px_0px_#00FFCC]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jojo-purple">
            Admin Access
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase">The Stand Archive</h1>
          <p className="mt-2 text-sm text-black/70">
            Enter your admin API key to manage uploads and product tags.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verifyKey()}
            placeholder="ADMIN_API_KEY"
            className="mt-6 w-full border-4 border-black bg-white px-4 py-3 text-sm font-mono outline-none focus:shadow-[4px_4px_0px_#D600FF]"
          />
          {error && (
            <p className="mt-3 text-xs font-bold uppercase text-red-700">{error}</p>
          )}
          <button
            type="button"
            onClick={verifyKey}
            disabled={checking || !input}
            className="mt-4 w-full border-4 border-black bg-black py-3 text-sm font-black uppercase text-jojo-cyan disabled:opacity-50"
          >
            {checking ? "Verifying…" : "Enter Admin →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="border-b-4 border-black bg-black text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jojo-cyan">
              Admin Panel
            </p>
            <p className="text-sm font-black uppercase">The Stand Archive</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="border-2 border-white/30 px-3 py-1.5 text-[10px] font-black uppercase hover:bg-white hover:text-black"
            >
              View Site
            </a>
            <button
              type="button"
              onClick={logout}
              className="border-2 border-jojo-purple bg-jojo-purple px-3 py-1.5 text-[10px] font-black uppercase"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
