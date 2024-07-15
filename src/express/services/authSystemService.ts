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
    // return tokens to controller

    const { email, password } = userRegistrationSchema.parse(body);
    const isExist = await this.authDb.getUserByEmail(email);
    if (isExist) throw new BadRequestError(`User with email ${email} already exists`);

    const stripeCustomer = await this.stripeService.createStripeCustomer(email);

    const hashedPassword = bcrypt.hashSync(password, 5);
    const insertedUser = await this.authDb.createAndGetUser({
      email,
      password: hashedPassword,
      stripeCustomerId: stripeCustomer.id,
    });

    const tokens = generateTokens(insertedUser.id);

    return tokens;
  }

  public async login(body: { email: string; password: string }) {
    const { email, password } = userRegistrationSchema.parse(body);
    const user = await this.authDb.login(email, password);

    const isExist = await this.authDb.getUserByEmail(email);
    if (!isExist) throw new BadRequestError(`User with email'${email}' not found`);

    const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordIsValid) throw new BadRequestError("Incorrect password");

    const tokens = generateTokens(user.id);
    return tokens;
  }

  public async googleAuth(body: { googleId: string; email: string }) {
    const { googleId, email } = userGoogleRegistrationSchema.parse(body);
    const isExistEmail = await this.authDb.getUserByEmail(email);
    const isExistGoogleId = await this.authDb.getUserByGoogleId(googleId);

    let user;
    if (isExistEmail || isExistGoogleId) {
      // If user exist - return user
      user = isExistEmail || isExistGoogleId;
    } else {
      // If user not exist - create user
      const stripeCustomer = await this.stripeService.createStripeCustomer(email);
      user = await this.authDb.googleAuth({
        googleId,
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
  email: string;
  passwordHash: string;
  stripeCustomerId: string;
};
