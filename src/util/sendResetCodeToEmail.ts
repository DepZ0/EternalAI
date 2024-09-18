import { sendEmailSettings } from "googleAuth/emailSender";

async function sendEmail(email: string, name: string, code: string) {
  try {
    await sendEmailSettings(
      email,
      "Reset password",
      `Code for reset your password`,
      `<p>Hello ${name}! You have 10 minutes to use this code.
        Use this code to reset your password ${code}</p>`
    );
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export default sendEmail;
