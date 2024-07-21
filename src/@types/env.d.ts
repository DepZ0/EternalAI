declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    ACCESS_TOKEN_EXPIRES: string;
    REFRESH_TOKEN_EXPIRES: string;
    JWT_SECRET_KEY: string;
    REFRESH_TOKEN_SECRET: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    STRIPE_SECRET: string;
    OPEN_AI_SECRET: string;
    OPEN_AI_CHAT_MODEL: string;
  }
}
