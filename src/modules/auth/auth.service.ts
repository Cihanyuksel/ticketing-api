import * as jwt from "jsonwebtoken";
import redisClient from "../../config/redis";
import {
  ConflictError,
  UnauthorizedError,
  InternalServerError,
  ForbiddenError,
} from "../../common/errors/app.error";
import { User } from "./user.entity";
import { LoginDTO, RefreshTokenDTO, RegisterDTO } from "./auth.dto";

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly ACCESS_EXPIRES = "15m";
  private readonly REFRESH_EXPIRES = "7d";
  private readonly REFRESH_EXPIRES_SEC = 7 * 24 * 60 * 60;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_ATTEMPT_WINDOW = 900;

  //Register
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await User.findOneBy({ email: data.email });
    if (existingUser)
      throw new ConflictError("Bu email adresi zaten kullanımda.");

    const newUser = User.create({ ...data });
    await newUser.save();

    return this.generateAuthResponse(newUser);
  }

  //Login
  async login(data: LoginDTO): Promise<AuthResponse> {
    const { email, password } = data;

    const attempts = await redisClient.get(`login_attempts:${email}`);
    if (attempts && parseInt(attempts) >= this.MAX_LOGIN_ATTEMPTS) {
      throw new ForbiddenError(
        "Hesabınız geçici olarak kilitlendi. 15 dakika sonra tekrar deneyin."
      );
    }

    const user = await User.findOne({
      where: { email },
      select: [
        "id",
        "email",
        "password",
        "role",
        "firstName",
        "lastName",
        "isActive",
      ],
    });

    if (!user || !(await user.validatePassword(password))) {
      await redisClient.incr(`login_attempts:${email}`);
      await redisClient.expire(
        `login_attempts:${email}`,
        this.LOGIN_ATTEMPT_WINDOW
      );

      throw new UnauthorizedError("Email veya şifre hatalı.");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Hesabınız devre dışı bırakılmış.");
    }

    await redisClient.del(`login_attempts:${email}`);

    return this.generateAuthResponse(user);
  }

  //Refresh Token Flow
  async refresh(data: RefreshTokenDTO): Promise<AuthResponse> {
    const { refreshToken } = data;

    let payload: any;
    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) throw new InternalServerError("JWT Refresh Secret eksik.");

      payload = jwt.verify(refreshToken, secret);
    } catch (error) {
      throw new UnauthorizedError("Geçersiz Refresh Token");
    }

    const userId = payload.sub;

    const storedToken = await redisClient.get(`refresh_token:${userId}`);

    if (!storedToken) {
      throw new UnauthorizedError(
        "Oturum süresi dolmuş, tekrar giriş yapınız."
      );
    }

    if (storedToken !== refreshToken) {
      await redisClient.del(`refresh_token:${userId}`);
      throw new ForbiddenError(
        "Güvenlik ihlali tespit edildi. Lütfen tekrar giriş yapın."
      );
    }

    const user = await User.findOne({
      where: { id: userId },
      select: ["id", "email", "role", "firstName", "lastName", "isActive"],
    });

    if (!user) throw new UnauthorizedError("Kullanıcı bulunamadı.");

    if (!user.isActive) {
      throw new ForbiddenError("Hesabınız devre dışı bırakılmış.");
    }

    await redisClient.del(`refresh_token:${userId}`);

    return this.generateAuthResponse(user);
  }

  //Logout
  async logout(userId: string, accessToken: string): Promise<void> {
    try {
      await Promise.all([
        redisClient.del(`refresh_token:${userId}`),
        redisClient.set(`blacklist:${accessToken}`, "1", { EX: 900 }),
      ]);
    } catch (error) {
      throw new InternalServerError("Logout işlemi başarısız.");
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private async generateAuthResponse(user: User): Promise<AuthResponse> {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new InternalServerError("JWT Config eksik.");
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    // Access Token
    const accessToken = jwt.sign(payload, accessSecret, {
      expiresIn: this.ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
    });

    // Refresh Token
    const refreshToken = jwt.sign({ sub: user.id }, refreshSecret, {
      expiresIn: this.REFRESH_EXPIRES as jwt.SignOptions["expiresIn"],
    });

    // Redis Save
    try {
      await redisClient.set(`refresh_token:${user.id}`, refreshToken, {
        EX: this.REFRESH_EXPIRES_SEC,
      });
    } catch (error) {
      throw new InternalServerError("Token kaydedilemedi.");
    }

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User): Partial<User> {
    const userObj = { ...user };
    delete (userObj as any).password;
    return userObj;
  }
}
