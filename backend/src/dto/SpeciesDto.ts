export interface GetSpeciesQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  createdAt_gte?: string;
  createdAt_lte?: string;
  search?: string;
  isArchived?: string;
  createdBy?: string;
}

export interface CreateSpeciesDto {
  scientificName: string;
  commonNameEn: string;
  commonNameEs: string;
}

export interface UpdateSpeciesDto {
  scientificName: string;
  commonNameEn: string;
  commonNameEs: string;
}
