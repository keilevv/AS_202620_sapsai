import { AuthRepository } from "../repositories/AuthRepository";
import bcrypt from "bcryptjs";
import { LocalRegisterDto } from "../dto/AuthDto";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sanitizeUser } from "../utils";

export class AuthService {
  private authRepo = new AuthRepository();

  async register(dto: LocalRegisterDto) {
    const existing = await this.authRepo.findUserByEmail(dto.email);
    if (existing) throw new Error("User already exists");

    let hash = "";
    if (dto.password) {
      hash = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.authRepo.createUser({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone,
      passwordHash: hash,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) throw new Error("No refresh token provided");

    const decoded: any = await Promise.resolve(verifyRefreshToken(refreshToken));
    const user = await this.authRepo.findUserById(decoded.id);

    if (!user) throw new Error("User not found");

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
