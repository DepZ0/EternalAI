import { UserDataBase } from "database/userDb";
import jwt from "jsonwebtoken";

const jwtConst = {
  ACCESS_TOKEN_EXPIRATION: "1d",
  REFRESH_TOKEN_EXPIRATION: "7d",
} as const;

export class RefreshTokenService {
  constructor(private userDb: UserDataBase) {}

  public refreshToken = async (userId: number, refreshToken: string) => {
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return { error: "Invalid refresh token" };
    }

    const user = await this.userDb.getUserById(userId);
    if (!user) {
      return { error: "User not found" };
    }

    const newAccessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: jwtConst.ACCESS_TOKEN_EXPIRATION,
    });

    return { accessToken: newAccessToken };
  };
}
