import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface UserPayload {
  id: number;
}

export interface RequestWithUser extends Request {
  user?: UserPayload;
}

export const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (token === null) return res.sendStatus(401).json("Unauthorized token");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user: UserPayload) => {
    if (err) return res.sendStatus(403).json("Forbidden/Expired token");
    req.user = user;
    next();
  });
};
