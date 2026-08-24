import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/tokens";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "token is not found ",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

 req.user = decoded     
 console.log(req.user)
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired access token",
    });
  }
  next()
}
