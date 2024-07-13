import { AuthDataBase } from "../../database/authSystemDb";
import { BadRequestError } from "../../util/customErrors";
import { generateTokens } from "../../util/jwtTokens";
import { userRegistrationSchema } from "../../util/zodSchemas";
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
}
