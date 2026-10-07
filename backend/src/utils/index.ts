import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { baseSpecies } from "../config";

export function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function createDefaultAdmin() {
  const defaultEmail = process.env.DEFAULT_EMAIL || "adminleaf@yopmail.com";
  const defaultUsername = process.env.DEFAULT_USERNAME || "admin";
  const defaultPassword = process.env.DEFAULT_PASSWORD || "admin123";
  const userCount = await prisma.user.count({});
  if (userCount > 0) {
    return null; // Admin user already exists
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });
  if (existingAdmin) {
    return null; // Admin user with default email already exists
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const adminUser = await prisma.user.create({
    data: {
      email: defaultEmail,
      fullName: "Admin User",
      phone: "",
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Default admin user created:");
  console.log(`  Username: ${defaultUsername}`);
  console.log(`  Password: ${defaultPassword}`);
  return adminUser;
}

export async function createDefaultSpecies() {
  const defaultEmail = process.env.DEFAULT_EMAIL || "adminleaf@yopmail.com";
  const speciesCount = await prisma.species.count({});
  if (speciesCount > 0) {
    return null;
  }
  const adminUser = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });
  baseSpecies.map(async (defaultSpecies) => {
    const existingSpecies = await prisma.species.findUnique({
      where: { slug: defaultSpecies.slug },
    });
    if (existingSpecies) {
      return null;
    }
    const species = await prisma.species.create({
      data: {
        commonNameEs: defaultSpecies.commonNameEs,
        commonNameEn: defaultSpecies.commonNameEn,
        scientificName: defaultSpecies.scientificName,
        createdById: adminUser?.id,
        slug: defaultSpecies.slug,
      },
    });

    console.log("Default species created:");
    console.log(`  Common Name: ${species.commonNameEn}`);
    console.log(`  Scientific Name: ${species.scientificName}`);
    return species;
  });
}

export async function updateEntriedSpecies() {
  const species = await prisma.species.findMany({});
  species.map(async (species) => {
    const foundMatch = baseSpecies.find((sp) => sp.slug === species.slug);
    if (
      foundMatch &&
      (foundMatch.slug !== species.slug ||
        foundMatch.commonNameEs !== species.commonNameEs ||
        foundMatch.commonNameEn !== species.commonNameEn)
    ) {
      console.log("Updating species:", species);
      await prisma.species.update({
        where: { id: species.id },
        data: {
          commonNameEs: foundMatch.commonNameEs,
          commonNameEn: foundMatch.commonNameEn,
          scientificName: foundMatch.scientificName,
          slug: foundMatch.slug,
        },
      });
    }
  });
}

export async function updateEntriedClassifications() {
  const classifications = await prisma.classification.findMany({});
  classifications.map(async (classification) => {
    const matchingSpecies = await prisma.species.findUnique({
      where: { slug: classification.species },
    });
    if (matchingSpecies) {
      await prisma.classification.update({
        where: { id: classification.id },
        data: {
          commonNameEs: matchingSpecies.commonNameEs,
          commonNameEn: matchingSpecies.commonNameEn,
          scientificName: matchingSpecies.scientificName,
          speciesId: matchingSpecies.id,
        },
      });
    }
  });
}

export async function updateTaggedHealthy() {
  const classifications = await prisma.classification.findMany({});
  classifications.map(async (classification) => {
    if (classification.isHealthy !== classification.taggedHealthy) {
      await prisma.classification.update({
        where: { id: classification.id },
        data: {
          taggedHealthy: classification.isHealthy,
        },
      });
    }
  });
}
