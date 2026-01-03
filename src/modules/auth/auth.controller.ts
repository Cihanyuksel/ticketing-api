import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../common/responses/api-response";
import { asyncHandler } from "../../common/middleware/async-handler";

export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/register
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    return ApiResponse.created(res, result, "Kayıt işlemi başarılı");
  });

  // POST /auth/login
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    return ApiResponse.success(res, result, "Giriş başarılı");
  });

  // POST /auth/refresh
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.refresh(req.body);
    return ApiResponse.success(res, result, "Token yenilendi");
  });

  // POST /auth/logout
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(" ")[1];

    if (userId && token) {
      await this.authService.logout(userId, token);
    }

    return ApiResponse.success(res, null, "Çıkış yapıldı");
  });
}
