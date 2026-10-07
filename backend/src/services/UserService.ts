import { UserRepository } from "../repositories/UserRepository";
import bcrypt from "bcryptjs";
import { UpdateUserDto } from "../dto/UserDto";
import { sanitizeUser } from "../utils";

export class UserService {
  private userRepo = new UserRepository();

  async getUser(id: string, actingUserId: string) {
    if (id !== actingUserId) {
      const actingUser = await this.userRepo.findUserById(actingUserId);
      if (!actingUser || actingUser.role !== "ADMIN") {
        throw new Error("Forbidden");
      }
    }

    const user = await this.userRepo.findUserById(id);
    if (!user) throw new Error("User not found");
    return { user: sanitizeUser(user) };
  }

  async updateUser(id: string, actingUserId: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findUserById(id);
    if (!user) throw new Error("User not found");

    if (id !== actingUserId) {
      const actingUser = await this.userRepo.findUserById(actingUserId);
      if (!actingUser || actingUser.role !== "ADMIN") {
        throw new Error("Forbidden");
      }
    }

    if (dto.requestedContributorStatus === true) {
      const requiredFields = ["fullName", "email", "phone", "institution", "department", "location", "bio"];
      const candidate: any = { ...user, ...dto };
      for (const field of requiredFields) {
        if (!candidate[field] || candidate[field] === "") {
          throw new Error(`Missing required field: ${field}`);
        }
      }
    }

    const data: any = {
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      institution: dto.institution,
      department: dto.department,
      location: dto.location,
      bio: dto.bio,
      emailNotifications: dto.emailNotifications,
      requestedContributorStatus: dto.requestedContributorStatus,
    };

    if (dto.password && dto.password.trim().length > 0) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.userRepo.updateUser(id, data);
    return { user: sanitizeUser(updatedUser) };
  }
}
