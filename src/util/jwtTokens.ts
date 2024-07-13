import jwt from "jsonwebtoken";

const jwtConst = {
  ACCESS_TOKEN_EXPIRATION: "1d",
  REFRESH_TOKEN_EXPIRATION: "7d",
} as const;

export function generateTokens(userId: number) {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: jwtConst.ACCESS_TOKEN_EXPIRATION,
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: jwtConst.REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
}

type SucessDecoded = {
  success: true;
  decoded: any;
};
type FailedDecoded = {
  success: false;
};
type VerifyToken = SucessDecoded | FailedDecoded;
export function verifyToken(token: string, secret: string): VerifyToken {
  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, decoded };
  } catch (error: any) {
    return { success: false };
  }
}
