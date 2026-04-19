import dotenv from "dotenv";

dotenv.config();

// ============================================================
// EMAIL CONFIG — uses Brevo REST API directly
// No SDK needed — just a simple HTTP call
// Works locally AND in production on Render
// Sends to any email in the world
// ============================================================

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  const senderEmail =
    process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || process.env.EMAIL_FROM!;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: "NestFinder Pro", email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
  }

  console.log(`Email sent to ${to}`);
};