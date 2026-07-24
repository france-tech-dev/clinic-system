import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { AuthPage } from "@/app/(not-authenticated)/_components/auth-page";

export default function ChangePasswordPage() {
  return (
    <AuthPage>
      <ChangePasswordForm />
    </AuthPage>
  );
}
