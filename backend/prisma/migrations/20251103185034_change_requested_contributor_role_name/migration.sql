/*
  Warnings:

  - You are about to drop the column `requestedContributorStatus` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "requestedContributorStatus",
ADD COLUMN     "requestedContributorRole" BOOLEAN NOT NULL DEFAULT false;
