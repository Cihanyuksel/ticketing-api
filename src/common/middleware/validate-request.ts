import { Request, Response, NextFunction } from "express";
import {
  validate,
  ValidationError as ClassValidatorError,
} from "class-validator";
import { plainToInstance } from "class-transformer";
import { ValidationError } from "../errors/app.error";

export const validateRequest = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoObject = plainToInstance(dtoClass, req.body as any);

      const errors: ClassValidatorError[] = await validate(dtoObject);

      if (errors.length > 0) {
        const errorMessages = errors.flatMap((error) => {
          return error.constraints
            ? Object.values(error.constraints)
            : ["Geçersiz veri"];
        });

        throw new ValidationError("Validasyon hatası", errorMessages);
      }

      req.body = dtoObject;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoObject = plainToInstance(dtoClass, req.params as any);
      const errors = await validate(dtoObject);

      if (errors.length > 0) {
        const errorMessages = errors.flatMap((error) =>
          error.constraints ? Object.values(error.constraints) : ["Hata"]
        );
        throw new ValidationError("Parametre hatası", errorMessages);
      }

      req.params = dtoObject as any;
      next();
    } catch (error) {
      next(error);
    }
  };
};
