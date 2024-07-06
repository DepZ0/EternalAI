import { Request, Response, NextFunction } from "express";

export const extractRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    req.body.refreshToken = refreshToken;
  }
  next();
};

export const extractAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;
  if (accessToken) {
    req.body.accessToken = accessToken;
  }
  next();
};
