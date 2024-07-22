import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwtTokens";

export interface UserPayload {
  id: number;
}

export interface RequestWithUser extends Request {
  user?: UserPayload;
}

export const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Unauthorized");

  const response = verifyToken(token, process.env.JWT_SECRET_KEY!);
  if (!response.success) return res.status(401).json("Unauthorized");

  req.user = response.decoded as UserPayload;
  next();
};
