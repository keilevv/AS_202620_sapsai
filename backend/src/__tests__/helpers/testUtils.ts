/**
 * Common test utilities and helpers
 */

import { User, Species, Classification } from "@prisma/client";

export const mockUser: Partial<User> = {
  id: "user-123",
  email: "test@example.com",
  fullName: "Test User",
  phone: "1234567890",
  role: "USER",
  passwordHash: "hashed_password",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdminUser: Partial<User> = {
  ...mockUser,
  id: "admin-123",
  email: "admin@example.com",
  fullName: "Admin User",
  role: "ADMIN",
};

export const mockSpecies: Partial<Species> = {
  id: "species-123",
  scientificName: "Zea mays",
  commonNameEn: "Corn",
  commonNameEs: "Maíz",
  slug: "zea-mays",
  createdById: "user-123",
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockClassification: Partial<Classification> = {
  id: "classification-123",
  userId: "user-123",
  species: "zea-mays",
  shape: "elliptic",
  taggedSpecies: "zea-mays",
  taggedShape: "elliptic",
  taggedHealthy: false,
  isHealthy: false,
  speciesConfidence: 0.95,
  shapeConfidence: 0.88,
  originalFilename: "test-image.jpg",
  imagePath: "/uploads/test-image.jpg",
  status: "PENDING",
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

