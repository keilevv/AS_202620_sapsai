/*
  Warnings:

  - You are about to drop the column `requestedContributorRole` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "requestedContributorRole",
ADD COLUMN     "requestedContributorStatus" BOOLEAN NOT NULL DEFAULT false;
