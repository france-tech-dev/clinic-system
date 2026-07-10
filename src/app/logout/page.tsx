"use client";

import { signOut } from "@/shared/lib/auth-client";
import { paths } from "@/shared/constants/paths";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ query: { redirect: paths.auth.login } });
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        Deslogando <IconLoader2 className="w-4 h-4 animate-spin" />
      </h1>
    </div>
  );
}
