import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { paths } from "@/shared/constants/paths";
import Image from "next/image";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const { aviso } = await searchParams;
  const inactiveNotice =
    aviso === "inativo"
      ? "O seu acesso a esta clínica está inativo. Contacte um administrador."
      : null;

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href={paths.root}
            className="flex items-center gap-2 font-medium"
          >
            <div className="flex h-20 w-20 items-center justify-center">
              <Image
                src="/logo.png"
                alt="Boilerplate"
                width={200}
                height={200}
                className="mx-auto max-w-full object-contain"
              />
            </div>
            Boilerplate
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm accessNotice={inactiveNotice} />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://i.pinimg.com/736x/64/54/ae/6454ae91eb3a58e151efce7e1121c14a.jpg"
          alt="Barbershop interior"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
