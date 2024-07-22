import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { App } from "./app";
import "dotenv/config";
import Stripe from "stripe";
import OpenAI from "openai";
import { RefreshTokenService } from "./express/services/refreshTokenService";
import { RefreshTokenController } from "./express/controllers/refreshTokenController";
import { StripeService } from "./express/services/stripeService";
import { AuthDataBase } from "./database/authSystemDb";
import { AuthService } from "./express/services/authSystemService";
import { AuthController } from "./express/controllers/authController";
import { WebhookController } from "./express/controllers/webhookController";
import { UserDataBase } from "database/userDb";
import { UserService } from "express/services/userService";
import { UserController } from "express/controllers/userController";
import { OpenAiService } from "express/services/openAiService";
import { OpenAiController } from "express/controllers/openAiController";
import { OpenAiDataBase } from "database/openAiDb";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { logger: false });

  const stripe = new Stripe(`${process.env.STRIPE_SECRET}`);
  const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_SECRET,
  });

  await migrate(db, { migrationsFolder: "drizzle" });

  const stripeService = new StripeService(stripe);

  const webhookController = new WebhookController(db);

  const authDb = new AuthDataBase(db);
  const authService = new AuthService(authDb, stripeService);
  const authController = new AuthController(authService);

  const userDb = new UserDataBase(db);
  const userService = new UserService(userDb, stripeService);
  const userController = new UserController(userService);

  const openAiDataBase = new OpenAiDataBase(db);
  const openAiService = new OpenAiService(openAiDataBase, userDb, openai);
  const openAiController = new OpenAiController(openAiService);

  const refreshTokenService = new RefreshTokenService(userDb);
  const refreshTokenController = new RefreshTokenController(refreshTokenService);

  const app = new App(3000, [
    authController,
    webhookController,
    userController,
    refreshTokenController,
    openAiController,
  ]);
  app.start();
}

main();
