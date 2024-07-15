import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { App } from "./app";
import "dotenv/config";
import Stripe from "stripe";
import { ChangeProfileDetailsDb } from "./database/changeProfileDetailsDb";
import { ChangeProfileDetailsService } from "./express/services/changeProfileDetailsService";
import { ChangeProfileDetailsController } from "./express/controllers/changeProfileDetailsController";
import { RefreshTokenDb } from "./database/refreshTokenDb";
import { RefreshTokenService } from "./express/services/refreshTokenService";
import { RefreshTokenController } from "./express/controllers/refreshTokenController";
import { ProfileDb } from "./database/profileDb";
import { ProfileService } from "./express/services/profileService";
import { ProfileController } from "./express/controllers/profileController";
import { StripeService } from "./express/services/stripeService";
import { AuthDataBase } from "./database/authSystemDb";
import { AuthService } from "./express/services/authSystemService";
import { AuthController } from "./express/controllers/authController";
import { WebhookController } from "./express/controllers/webhookController";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { logger: false });

  const stripe = new Stripe(`${process.env.STRIPE_SECRET}`);

  await migrate(db, { migrationsFolder: "drizzle" });

  const changeProfileDetailsDb = new ChangeProfileDetailsDb(db, pool);
  const changeProfileDetailsService = new ChangeProfileDetailsService(changeProfileDetailsDb);
  const changeProfileDetailsController = new ChangeProfileDetailsController(changeProfileDetailsService);

  const refreshTokenDb = new RefreshTokenDb(db, pool);
  const refreshTokenService = new RefreshTokenService(refreshTokenDb);
  const refreshTokenController = new RefreshTokenController(refreshTokenService);

  const profileDb = new ProfileDb(db, pool);
  const profileService = new ProfileService(profileDb);
  const profileController = new ProfileController(profileService);

  const stripeService = new StripeService(stripe);

  const authDb = new AuthDataBase(db);
  const authService = new AuthService(authDb, stripeService);
  const authController = new AuthController(authService);

  const webhookController = new WebhookController();

  const app = new App(3000, [authController, webhookController]);
  app.start();
}

main();
