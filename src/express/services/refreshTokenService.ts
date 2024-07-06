import { RefreshTokenDb } from "../../database/refreshTokenDb";

export class RefreshTokenService {
  constructor(private refreshTokenDb: RefreshTokenDb) {}

  public refreshToken = async (userAgent: string, refreshToken: string) => {
    const newAccessToken = await this.refreshTokenDb.refreshToken(userAgent, refreshToken);
    return newAccessToken;
  };
}
