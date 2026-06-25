"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "./ui";

export default function Header() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Exodus Event Workforce System
        </h1>
        <p className="text-slate-600">
          Events, employee rates, guard clock-in/out, and automatic payout reports.
        </p>
      </div>

      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}