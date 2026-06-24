// import GuardWorkforceSystem from "./component/GuardWorkforceSystem";

// export default function Home() {
//   return <GuardWorkforceSystem />;
// }

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import GuardWorkforceSystem from "./component/GuardWorkforceSystem";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setChecking(false);
    }

    checkUser();
  }, [router]);

  if (checking) {
    return <div className="p-6">Checking login...</div>;
  }

  return <GuardWorkforceSystem />;
}