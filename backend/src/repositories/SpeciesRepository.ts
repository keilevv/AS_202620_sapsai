import prisma from "../lib/prisma";

export class SpeciesRepository {
  async countSpecies(where: any) {
    return prisma.species.count({ where });
  }

  async findManySpecies(where: any, orderBy: any, skip: number, take: number) {
    return prisma.species.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { createdBy: true },
    });
  }

  async findUniqueSpeciesBySlug(slug: string) {
    return prisma.species.findUnique({ where: { slug } });
  }

  async createSpecies(data: any) {
    return prisma.species.create({
      data,
      include: { createdBy: true },
    });
  }

  async updateSpecies(id: string, data: any) {
    return prisma.species.update({
      where: { id },
      data,
    });
  }

  async deleteSpecies(id: string) {
    return prisma.species.delete({
      where: { id },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}
