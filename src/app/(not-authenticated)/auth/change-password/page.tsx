import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { paths } from "@/shared/constants/paths";

export default function ChangePasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href={paths.root}
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Clinic System
        </Link>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
