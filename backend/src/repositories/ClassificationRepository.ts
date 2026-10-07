import prisma from "../lib/prisma";

export class ClassificationRepository {
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
    });
  }

  async createClassification(data: any) {
    return prisma.classification.create({ data });
  }

  async updateClassification(id: string, data: any) {
    return prisma.classification.update({
      where: { id },
      data,
    });
  }

  async findSpeciesBySlug(slug: string) {
    return prisma.species.findFirst({
      where: { slug },
    });
  }
}
