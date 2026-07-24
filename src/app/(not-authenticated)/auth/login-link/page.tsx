import { LoginLinkForm } from "@/components/auth/login-link-form";
import { AuthPage } from "@/app/(not-authenticated)/_components/auth-page";

export default function LoginLinkPage() {
  return (
    <AuthPage>
      <LoginLinkForm />
    </AuthPage>
  );
}
