export interface GetClassificationsAdminQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  isArchived?: string;
  createdAt_gte?: string;
  createdAt_lte?: string;
}

export interface UpdateClassificationAdminDto {
  taggedShape?: string;
  taggedSpecies?: string;
  taggedHealthy?: boolean;
  status?: string;
  isArchived?: boolean;
}

export interface GetUsersAdminQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: string;
  isArchived?: string;
  requestedContributorStatus?: string;
  createdAt_gte?: string;
  createdAt_lte?: string;
}

export interface UpdateUserAdminDto {
  fullName?: string;
  email?: string;
  phone?: string;
  institution?: string;
  department?: string;
  location?: string;
  bio?: string;
  password?: string;
  emailNotifications?: boolean;
  role?: string;
  isArchived?: boolean;
  requestedContributorStatus?: boolean;
}
