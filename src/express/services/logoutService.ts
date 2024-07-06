import { LogoutDb } from "../../database/logoutDb";

export class LogoutService {
  constructor(private logoutDb: LogoutDb) {}

  public logout = async (refreshToken: string) => {
    await this.logoutDb.logout(refreshToken);
  };
}
