import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../responses/api-response";
import { UserRole } from "../constant/roles.enum";

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.custom(res, 401, null, "Oturum açmanız gerekiyor.");
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      return ApiResponse.custom(
        res,
        403,
        null,
        "Bu işlem için yetkiniz bulunmamaktadır."
      );
    }

    next();
  };
};
