import nodemailer from "nodemailer";
import { GOOGLE_SENDER_EMAIL, GOOGLE_SENDER_EMAIL_PASS } from "./googleSettings";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Замените на ваш SMTP сервер
  port: 587, // Обычно используется порт 587 для TLS или 465 для SSL
  secure: false, // true для 465, false для других портов
  auth: {
    user: GOOGLE_SENDER_EMAIL, // Ваш email
    pass: GOOGLE_SENDER_EMAIL_PASS, // Ваш пароль
  },
});

export const sendEmailSettings = async (to: string, subject: string, text: string, html?: string): Promise<void> => {
  const mailOptions = {
    from: `"EternalAI" <${GOOGLE_SENDER_EMAIL}>`, // Имя отправителя и email
    to, // Получатель
    subject, // Тема письма
    text, // Текстовая версия письма
    html, // HTML версия письма (опционально)
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
