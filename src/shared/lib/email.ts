import "server-only";

import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import type { ReactElement } from "react";

type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

function getTransporter() {
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_KEY;

  if (!user || !pass) {
    throw new Error("BREVO_SMTP_USER and BREVO_SMTP_KEY must be set");
  }

  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST ?? "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT ?? 587),
    secure: false,
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, react }: SendEmailInput) {
  const from = process.env.EMAIL_NO_REPLY;
  if (!from) {
    throw new Error("EMAIL_NO_REPLY is not set");
  }

  const html = await render(react);
  await getTransporter().sendMail({ from, to, subject, html });
}
