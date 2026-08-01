import Link from "next/link";
import Image from "next/image";
import { paths } from "@/shared/constants/paths";

type AuthPageProps = {
  children: React.ReactNode;
};

export function AuthPage({ children }: AuthPageProps) {
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
                alt="Movi Clinicas"
                width={200}
                height={200}
                className="mx-auto max-w-full object-contain"
                loading="eager"
              />
            </div>
            Movi Clinicas
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/auth-clinica.jpg"
          alt="Professional attending to a patient"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          width={1000}
          height={1000}
          loading="eager"
        />
      </div>
    </div>
  );
}
