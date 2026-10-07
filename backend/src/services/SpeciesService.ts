import { SpeciesRepository } from "../repositories/SpeciesRepository";
import { baseShapes } from "../config";
import { GetSpeciesQuery, CreateSpeciesDto, UpdateSpeciesDto } from "../dto/SpeciesDto";

function slugify(string: String) {
  return String(string)
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, "")
    .replace(/[\s._]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$|\.$/g, "");
}

export class SpeciesService {
  private speciesRepo = new SpeciesRepository();

  async getSpecies(query: GetSpeciesQuery) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const where: any = {};

    if (typeof query.isArchived !== "undefined") {
      where.isArchived = query.isArchived === "true";
    } else {
      where.isArchived = false;
    }

    if (query.createdAt_gte || query.createdAt_lte) {
      where.createdAt = {};
      if (query.createdAt_gte) where.createdAt.gte = new Date(query.createdAt_gte);
      if (query.createdAt_lte) where.createdAt.lte = new Date(query.createdAt_lte);
    }

    if (query.search) {
      where.OR = [
        { commonNameEs: { contains: query.search, mode: "insensitive" } },
        { commonNameEn: { contains: query.search, mode: "insensitive" } },
        { scientificName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [species, count] = await Promise.all([
      this.speciesRepo.findManySpecies(where, { [sortBy]: sortOrder }, skip, limit),
      this.speciesRepo.countSpecies(where),
    ]);

    return {
      count,
      pages: Math.ceil(count / limit),
      results: species,
      shapes: baseShapes,
    };
  }

  async createSpecies(userId: string, dto: CreateSpeciesDto) {
    if (!dto.scientificName || !dto.commonNameEn || !dto.commonNameEs) {
      throw new Error("scientificName, commonNameEn and commonNameEs are required");
    }

    const slug = slugify(dto.scientificName);
    const existing = await this.speciesRepo.findUniqueSpeciesBySlug(slug);
    if (existing) {
      throw new Error("Species with this slug already exists");
    }

    const created = await this.speciesRepo.createSpecies({
      scientificName: dto.scientificName,
      commonNameEn: dto.commonNameEn,
      commonNameEs: dto.commonNameEs,
      slug,
      createdById: userId,
    });

    return { species: created };
  }

  async updateSpecies(id: string, userId: string, dto: UpdateSpeciesDto) {
    const actingUser = await this.speciesRepo.findUserById(userId);
    if (!actingUser || actingUser.role !== "ADMIN") throw new Error("Unauthorized");

    if (!id || !dto.scientificName || !dto.commonNameEn || !dto.commonNameEs) {
      throw new Error("id, scientificName, commonNameEn and commonNameEs are required");
    }

    const slug = slugify(dto.scientificName);
    const updated = await this.speciesRepo.updateSpecies(id, {
      scientificName: dto.scientificName,
      commonNameEn: dto.commonNameEn,
      commonNameEs: dto.commonNameEs,
      slug,
    });

    return { species: updated };
  }

  async deleteSpecies(id: string, userId: string) {
    const actingUser = await this.speciesRepo.findUserById(userId);
    if (!actingUser || actingUser.role !== "ADMIN") throw new Error("Unauthorized");
    if (!id) throw new Error("id is required");

    const deleted = await this.speciesRepo.deleteSpecies(id);
    return { species: deleted };
  }
}
