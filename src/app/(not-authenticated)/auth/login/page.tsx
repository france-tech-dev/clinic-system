import { LoginForm } from "@/components/auth/login-form";
import { AuthPage } from "@/app/(not-authenticated)/_components/auth-page";
import { paths } from "@/shared/constants/paths";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string; callbackUrl?: string }>;
}) {
  const { aviso, callbackUrl: raw } = await searchParams;
  const inactiveNotice =
    aviso === "inactive"
      ? "O seu acesso a esta clínica está inativo. Contacte um administrador."
      : null;
      
  const callbackUrl =
    raw?.startsWith("/") && !raw.startsWith("//") ? raw : paths.agenda;

  return (
    <AuthPage>
      <LoginForm
        accessNotice={inactiveNotice}
        callbackUrl={callbackUrl}
      />
    </AuthPage>
  );
}
