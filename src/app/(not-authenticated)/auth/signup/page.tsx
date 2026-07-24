import { SignupForm } from "@/components/auth/signup-form";
import { AuthPage } from "@/app/(not-authenticated)/_components/auth-page";

export default function SignupPage() {
  return (
    <AuthPage>
      <SignupForm />
    </AuthPage>
  );
}
