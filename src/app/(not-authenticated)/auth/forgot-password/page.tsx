import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthPage } from "@/app/(not-authenticated)/_components/auth-page";

export default function ForgotPasswordPage() {
  return (
    <AuthPage>
      <ForgotPasswordForm />
    </AuthPage>
  );
}
