import { Request, Response, NextFunction } from "express";

import logger from "../../utils/logger";
import {
  AppError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../errors/app.error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Sunucu hatası";
  let errors: string[] = [];
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;

    if (err instanceof ValidationError) {
      errors = err.errors;
    }
  } else {
    logger.error("❌ Beklenmeyen Hata:", err);
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(isDevelopment && { stack: err.stack }),
  });

  if (!isOperational) {
    logger.error("🔥 Critical Error:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
    });
  }
};

/**
 * 404 Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new NotFoundError("Route", req.originalUrl);
  next(error);
};

/**
 * Database Error Handler
 */
export const handleDatabaseError = (error: any): AppError => {
  if (error.code === "23505") {
    return new ConflictError("Bu kayıt zaten mevcut");
  }

  if (error.code === "23503") {
    return new ValidationError("İlişkili kayıt bulunamadı");
  }

  if (error.code === "23502") {
    return new ValidationError("Zorunlu alan eksik");
  }

  return new InternalServerError("Veritabanı hatası");
};
