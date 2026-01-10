import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { validateRequest } from "../../common/middleware/validate-request";
import { authenticate } from "../../common/middleware/authenticate";
import { RegisterDTO, LoginDTO, RefreshTokenDTO } from "./auth.dto";
import { ApiResponse } from "../../common/responses/api-response";
import { TypeOrmUserRepository } from "./user.repository";

const router = Router();

const userRepository = new TypeOrmUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

//POST /api/auth/register
router.post("/register", validateRequest(RegisterDTO), authController.register);

//POST /api/auth/login
router.post("/login", validateRequest(LoginDTO), authController.login);

//POST /api/auth/refresh
router.post(
  "/refresh",
  validateRequest(RefreshTokenDTO),
  authController.refresh
);

//POST /api/auth/logout
router.post("/logout", authenticate, authController.logout);

router.get("/me", authenticate, (req, res) => {
  return ApiResponse.success(res, req.user, "Token doğrulama başarılı!");
});

export default router;
