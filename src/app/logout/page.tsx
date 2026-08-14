"use client";

import { Spinner } from "@/components/ui/spinner";
import { signOut } from "@/shared/lib/auth-client";
import { paths } from "@/shared/constants/paths";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      await signOut();
      const aviso = new URLSearchParams(window.location.search).get("aviso");
      const loginUrl = aviso
        ? `${paths.auth.login}?aviso=${encodeURIComponent(aviso)}`
        : paths.auth.login;
      router.replace(loginUrl);
    })();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        Deslogando <Spinner />
      </h1>
    </div>
  );
}
