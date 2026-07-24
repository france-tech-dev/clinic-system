import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthPage } from "@/app/(not-authenticated)/_components/auth-page";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <AuthPage>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPage>
  );
}
