// settings.ts

// Права доступа
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email", // доступ до адреси електронної пошти
  "https://www.googleapis.com/auth/userinfo.profile", // доступ до інформації профілю
];

// Посилання на аутентифікацію
export const GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth";

// Посилання на отримання токена
export const GOOGLE_TOKEN_URI = "https://accounts.google.com/o/oauth2/token";

// Посилання на отримання інформації про користувача
export const GOOGLE_USER_INFO_URI = "https://www.googleapis.com/oauth2/v1/userinfo";

// Client ID з кроку #3
export const GOOGLE_CLIENT_ID = "";

// Client Secret з кроку #3
export const GOOGLE_CLIENT_SECRET = "";

// Посилання з секції "Authorized redirect URIs" з кроку #3
export const GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google-callback";
