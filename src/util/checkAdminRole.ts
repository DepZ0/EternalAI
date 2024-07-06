import { Response, NextFunction } from "express";
import { RequestWithUser } from "./authenticateToken";

export const checkAdminRole = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  next();
};
