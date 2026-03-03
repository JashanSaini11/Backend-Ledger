import nodemailer from "nodemailer";
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
) => {
  try {
    const accessTokenResponse = await oAuth2Client.getAccessToken();

    if (!accessTokenResponse?.token) {
      throw new Error("Failed to generate access token");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessTokenResponse.token,
      },
    });

    await transporter.verify(); // useful for debugging

    const info = await transporter.sendMail({
      from: `"Backend-Ledge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);
    return info;

  } catch (err: any) {
    console.error("Email error:", err);
    throw err;
  }
};

async function sendRegistrationEmail(userEmail: string, name: string) {
  const subject = "Welcome to Backend-Ledge!";
  const text = `Hello ${name},\n\nThank you for registering with Backend-Ledge! We're excited to have you on board.\n\nBest regards,\nThe Backend-Ledge Team`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering with Backend-Ledge! We're excited to have you on board.</p><p>Best regards,<br>The Backend-Ledge Team</p>`;

  return await sendEmail(userEmail, subject, text, html);
}

export const emailService = {
  sendRegistrationEmail,
};