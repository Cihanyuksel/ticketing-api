import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../../config/redis";
import { ApiResponse } from "../responses/api-response";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.custom(
      res,
      401,
      null,
      "Token bulunamadı veya hatalı format."
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return ApiResponse.custom(
        res,
        401,
        null,
        "Token geçersiz. Lütfen tekrar giriş yapın."
      );
    }
  } catch (error) {
    console.error("Redis blacklist kontrolü hatası:", error);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = payload;
    next();
  } catch (error) {
    return ApiResponse.custom(
      res,
      401,
      null,
      "Geçersiz veya süresi dolmuş token."
    );
  }
};
