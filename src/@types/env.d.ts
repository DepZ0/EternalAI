declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET_KEY: string;
    REFRESH_TOKEN_SECRET: string;
    STRIPE_SECRET: string;
    OPEN_AI_SECRET: string;
    OPEN_AI_CHAT_MODEL: string;
  }
}
