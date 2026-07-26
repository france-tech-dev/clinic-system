import { AuthPage } from "@/app/(not-authenticated)/_components/auth-page";
import { ChangePasswordForm } from "./_components/change-password-form";

export default function ChangePasswordPage() {
  return (
    <AuthPage>
      <ChangePasswordForm />
    </AuthPage>
  );
}
