import { LoginDb } from "../../database/loginDb";

export class LoginService {
  constructor(private loginDb: LoginDb) {}
  public login = async (
    userAgent: string,
    email: string,
    password: string
  ): Promise<{ error?: string; accessToken?: string; refreshToken?: string }> => {
    const login = await this.loginDb.login(userAgent, email, password);
    return login;
  };
}
