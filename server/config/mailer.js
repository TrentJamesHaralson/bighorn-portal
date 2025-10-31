// server/config/mailer.js
// Safe mailer stub: works with or without SMTP configured

import nodemailer from "nodemailer";

export function makeMailer() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;

  // If SMTP variables are missing, disable real sending
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("Mailer disabled: SMTP environment variables not set.");
    return {
      send: async (msg) => {
        console.log("Simulated email send (mailer disabled):", msg?.to || "(no recipient)");
        return { accepted: [], rejected: [] };
      },
      transporter: null,
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  async function send({ to, subject, html, text }) {
    return transporter.sendMail({
      from: process.env.SMTP_FROM || SMTP_USER,
      to,
      subject,
      html,
      text,
    });
  }

  return { send, transporter };
}
