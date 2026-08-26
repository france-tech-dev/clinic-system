import { signIn } from "@/shared/lib/auth-client";
import { Button } from "../ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { IconBrandGoogle } from "@tabler/icons-react";

const SignInDialog = ({ callbackUrl }: { callbackUrl?: string }) => {
  const handleLoginWithGoogleClick = () =>
    signIn.social({ provider: "google", callbackURL: callbackUrl });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Faça login na plataforma</DialogTitle>
        <DialogDescription>
          Conecte-se usando sua conta do Google.
        </DialogDescription>
      </DialogHeader>

      <Button
        variant="outline"
        className="gap-1 font-bold"
        onClick={handleLoginWithGoogleClick}
      >
        <IconBrandGoogle className="size-4" />
        Google
      </Button>
    </>
  );
};

export default SignInDialog;
