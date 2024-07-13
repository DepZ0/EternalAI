import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "./jwtTokens";

export interface UserPayload {
  id: number;
}

export interface RequestWithUser extends Request {
  user?: UserPayload;
}

export const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (token === null) return res.sendStatus(401).json("Unauthorized");

  const response = verifyToken(token, process.env.REFRESH_TOKEN_SECRET!);
  if (!response.success) return res.sendStatus(401).json("Unauthorized");

  next();
};
