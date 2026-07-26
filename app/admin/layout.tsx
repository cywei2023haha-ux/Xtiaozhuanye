import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — The Stand Archive",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
