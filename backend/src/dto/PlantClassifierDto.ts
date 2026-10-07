export interface GetClassificationsQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  createdAt_gte?: string;
  createdAt_lte?: string;
  search?: string;
  status?: string;
  isArchived?: string;
  isHealthy?: string;
  classification?: string;
  originalFilename?: string;
  userId?: string;
}

export interface UpdateClassificationDto {
  taggedShape?: string;
  taggedSpecies?: string;
  taggedHealthy?: boolean;
  isArchived?: boolean;
}
