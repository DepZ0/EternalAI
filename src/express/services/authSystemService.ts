import { AuthDataBase } from "../../database/authSystemDb";
import { BadRequestError } from "../../util/customErrors";
import { generateTokens } from "../../util/jwtTokens";
import { userGoogleRegistrationSchema, userRegistrationSchema } from "../../util/zodSchemas";
import { StripeService } from "./stripeService";
import bcrypt from "bcryptjs";

export class AuthService {
  constructor(private authDb: AuthDataBase, private stripeService: StripeService) {}

  public async registration(body: { email: string; password: string }) {
    // validation incoming data +
    // is email is already taken? +
    // create customer in Stripe +
    // create user in DataBase +
    // generate tokens +
    // return tokens to controller +

    const { email, password } = userRegistrationSchema.parse(body);
    const isExist = await this.authDb.getUserByEmail(email);
    if (isExist) throw new BadRequestError(`User with email ${email} already exists`);

    const stripeCustomer = await this.stripeService.createStripeCustomer(email);

    const name = email.split("@")[0];
    const hashedPassword = bcrypt.hashSync(password, 5);
    const insertedUser = await this.authDb.createAndGetUser({
      email,
      name,
      password: hashedPassword,
      stripeCustomerId: stripeCustomer.id,
    });

    const tokens = generateTokens(insertedUser.id);

    return tokens;
  }

  public async login(body: { email: string; password: string }) {
    const { email, password } = userRegistrationSchema.parse(body);
    const user = await this.authDb.getUserByEmail(email);
    if (!user) throw new BadRequestError(`User with email '${email}' not found`);

    const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordIsValid) throw new BadRequestError("Incorrect password");

    const tokens = generateTokens(user.id);
    return tokens;
  }

  public async googleAuth(body: { googleId: string; email: string; name: string }) {
    const { googleId, email, name } = userGoogleRegistrationSchema.parse(body);

    // Check if the user exists by email or Google ID
    let user = await this.authDb.getUserByEmail(email);
    const userByGoogleId = await this.authDb.getUserByGoogleId(googleId);

    if (!user && userByGoogleId) {
      // If user exists by Google ID but not by email, load user by Google ID
      user = userByGoogleId;
    } else if (user && !user.googleId) {
      // If user exists by email but not by Google ID, assign the Google ID to this user
      await this.authDb.updateGoogleId(user.id, googleId);
      user.googleId = googleId;
    } else if (!user) {
      // If user does not exist, create a new one
      const stripeCustomer = await this.stripeService.createStripeCustomer(email);
      user = await this.authDb.googleAuth({
        googleId,
        name,
        email,
        stripeCustomerId: stripeCustomer.id,
      });
    }

    const tokens = generateTokens(user.id);
    return tokens;
  }
}

export type NewUser = {
  googleId: string;
  name: string;
  email: string;
  passwordHash: string;
  stripeCustomerId: string;
};
