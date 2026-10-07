import prisma from "../lib/prisma";

export class UserRepository {
  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
