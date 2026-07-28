import { LoginForm } from "@/components/auth/login-form";
import { AuthPage } from "@/app/(not-authenticated)/_components/auth-page";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const { aviso } = await searchParams;
  const inactiveNotice =
    aviso === "inactive"
      ? "O seu acesso a esta clínica está inativo. Contacte um administrador."
      : null;

  return (
    <AuthPage>
      <LoginForm accessNotice={inactiveNotice} />
    </AuthPage>
  );
}
