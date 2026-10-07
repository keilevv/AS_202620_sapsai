import prisma from "../lib/prisma";

export class AdminRepository {
  async countClassifications(where: any) {
    return prisma.classification.count({ where });
  }

  async findManyClassifications(where: any, orderBy: any, skip: number, take: number) {
    return prisma.classification.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { user: true },
    });
  }

  async findUniqueClassification(id: string) {
    return prisma.classification.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateClassification(id: string, data: any) {
    return prisma.classification.update({
      where: { id },
      data,
    });
  }

  async deleteClassification(id: string) {
    return prisma.classification.delete({
      where: { id },
    });
  }

  async countUsers(where: any) {
    return prisma.user.count({ where });
  }

  async findManyUsers(where: any, orderBy: any, skip: number, take: number) {
    return prisma.user.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { _count: { select: { classifications: true } } },
    });
  }

  async findUniqueUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { classifications: true } } },
    });
  }

  async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
