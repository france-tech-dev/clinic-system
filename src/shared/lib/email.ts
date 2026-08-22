import "server-only";

import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import type { ReactElement } from "react";
import { env } from "@/shared/env";

type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

function getTransporter() {
  const user = env.BREVO_SMTP_USER;
  const pass = env.BREVO_SMTP_KEY;

  if (!user || !pass) {
    throw new Error("BREVO_SMTP_USER and BREVO_SMTP_KEY must be set");
  }

  return nodemailer.createTransport({
    host: env.BREVO_SMTP_HOST,
    port: env.BREVO_SMTP_PORT,
    secure: false,
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, react }: SendEmailInput) {
  const from = env.EMAIL_NO_REPLY;
  if (!from) {
    throw new Error("EMAIL_NO_REPLY is not set");
  }

  const html = await render(react);
  await getTransporter().sendMail({ from, to, subject, html });
}
