import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { App } from "./app";
import "dotenv/config";
import Stripe from "stripe";
import { RegistrationDb } from "./database/registrationDb";
import { RegistrationService } from "./express/services/registrationService";
import { RegistrationController } from "./express/controllers/registrationController";
import { LoginDb } from "./database/loginDb";
import { LoginService } from "./express/services/loginService";
import { LoginController } from "./express/controllers/loginController";
import { ChangeProfileDetailsDb } from "./database/changeProfileDetailsDb";
import { ChangeProfileDetailsService } from "./express/services/changeProfileDetailsService";
import { ChangeProfileDetailsController } from "./express/controllers/changeProfileDetailsController";
import { LogoutDb } from "./database/logoutDb";
import { LogoutService } from "./express/services/logoutService";
import { LogoutController } from "./express/controllers/logoutController";
import { RefreshTokenDb } from "./database/refreshTokenDb";
import { RefreshTokenService } from "./express/services/refreshTokenService";
import { RefreshTokenController } from "./express/controllers/refreshTokenController";
import { DeleteAccountDb } from "./database/deleteAccountDb";
import { DeleteAccountService } from "./express/services/deleteAccountService";
import { DeleteAccountController } from "./express/controllers/deleteAccountController";
import { ProfileDb } from "./database/profileDb";
import { ProfileService } from "./express/services/profileService";
import { ProfileController } from "./express/controllers/profileController";
import { GoogleAuthDb } from "./database/googleAuthDb";
import { GoogleAuthService } from "./express/services/googleAuthService";
import { GoogleAuthController } from "./express/controllers/googleAuthController";
import { StripeService } from "./express/services/stripeService";
import { AuthDataBase } from "./database/authSystemDb";
import { AuthService } from "./express/services/authSystemService";
import { AuthController } from "./express/controllers/authController";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { logger: false });

  const stripe = new Stripe(process.env.STRIPE_SECRET);

  await migrate(db, { migrationsFolder: "drizzle" });

  const registrationDb = new RegistrationDb(db, pool);
  const registrationService = new RegistrationService(registrationDb);
  const registrationController = new RegistrationController(registrationService);

  const loginDb = new LoginDb(db, pool);
  const loginService = new LoginService(loginDb);
  const loginController = new LoginController(loginService);

  const changeProfileDetailsDb = new ChangeProfileDetailsDb(db, pool);
  const changeProfileDetailsService = new ChangeProfileDetailsService(changeProfileDetailsDb);
  const changeProfileDetailsController = new ChangeProfileDetailsController(changeProfileDetailsService);

  // const logoutDb = new LogoutDb(db, pool);
  // const logoutService = new LogoutService(logoutDb);
  // const logoutController = new LogoutController(logoutService);

  const refreshTokenDb = new RefreshTokenDb(db, pool);
  const refreshTokenService = new RefreshTokenService(refreshTokenDb);
  const refreshTokenController = new RefreshTokenController(refreshTokenService);

  // const deleteAccountDb = new DeleteAccountDb(db, pool);
  // const deleteAccountService = new DeleteAccountService(deleteAccountDb);
  // const deleteAccountController = new DeleteAccountController(deleteAccountService);

  const profileDb = new ProfileDb(db, pool);
  const profileService = new ProfileService(profileDb);
  const profileController = new ProfileController(profileService);

  const googleAuthDb = new GoogleAuthDb(db, pool);
  const googleAuthService = new GoogleAuthService(googleAuthDb);
  const googleAuthController = new GoogleAuthController(googleAuthService);

  const stripeService = new StripeService(stripe);

  const authDb = new AuthDataBase(db);
  const authService = new AuthService(authDb, stripeService);
  const authController = new AuthController(authService);

  const app = new App(3000, [authController]);
  app.start();
}

main();
