-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ClassificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT,
    "institution" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'EN',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Classification" (
    "id" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "shape" TEXT NOT NULL,
    "speciesConfidence" DOUBLE PRECISION NOT NULL,
    "shapeConfidence" DOUBLE PRECISION NOT NULL,
    "taggedSpecies" TEXT NOT NULL DEFAULT '',
    "taggedShape" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."ClassificationStatus" NOT NULL DEFAULT 'PENDING',
    "isHealthy" BOOLEAN NOT NULL DEFAULT true,
    "isPlant" BOOLEAN NOT NULL DEFAULT false,
    "commonNameEn" TEXT,
    "commonNameEs" TEXT,
    "scientificName" TEXT,
    "speciesId" TEXT,

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Species" (
    "id" TEXT NOT NULL,
    "commonNameEs" TEXT NOT NULL,
    "commonNameEn" TEXT NOT NULL,
    "slug" TEXT,
    "scientificName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Species_slug_key" ON "public"."Species"("slug");

-- AddForeignKey
ALTER TABLE "public"."Classification" ADD CONSTRAINT "Classification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Species" ADD CONSTRAINT "Species_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
