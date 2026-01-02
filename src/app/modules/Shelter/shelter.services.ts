import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

type TCreateShelter = {
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  phone: string;
  email?: string;
  website?: string;
};

type TUpdateShelter = Partial<TCreateShelter> & {
  logo?: string;
  latitude?: number;
  longitude?: number;
};

const createShelterProfile = async (userId: string, payload: TCreateShelter) => {
  // Check if user already has a shelter profile
  const existingShelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (existingShelter) {
    throw new ApiError(400, "Shelter profile already exists");
  }

  // Check if user is a SHELTER role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "SHELTER") {
    throw new ApiError(403, "Only shelter users can create shelter profiles");
  }

  const shelter = await prisma.shelter.create({
    data: {
      userId,
      ...payload,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return shelter;
};

const getMyShelterProfile = async (userId: string) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          cats: true,
          donations: true,
        },
      },
    },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  return shelter;
};

const updateShelterProfile = async (userId: string, payload: TUpdateShelter) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const updated = await prisma.shelter.update({
    where: { userId },
    data: payload,
  });

  return updated;
};

const getAllShelters = async (filters: {
  city?: string;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { city, isVerified, search, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (isVerified !== undefined) where.isVerified = isVerified;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const [shelters, total] = await Promise.all([
    prisma.shelter.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { cats: true },
        },
      },
    }),
    prisma.shelter.count({ where }),
  ]);

  return {
    shelters,
    meta: { page, limit, total },
  };
};

const getShelterById = async (id: string) => {
  const shelter = await prisma.shelter.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          cats: true,
          donations: true,
        },
      },
    },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter not found");
  }

  return shelter;
};

const verifyShelter = async (id: string, isVerified: boolean) => {
  const shelter = await prisma.shelter.findUnique({
    where: { id },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter not found");
  }

  const updated = await prisma.shelter.update({
    where: { id },
    data: { isVerified },
  });

  return updated;
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getNearbyShelters = async (
  latitude: number,
  longitude: number,
  maxDistanceKm = 50,
  limit = 10
) => {
  // Get all shelters with coordinates
  const shelters = await prisma.shelter.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      _count: {
        select: { cats: true },
      },
    },
  });

  // Calculate distances and filter
  const sheltersWithDistance = shelters
    .map((shelter) => ({
      ...shelter,
      distance: calculateDistance(
        latitude,
        longitude,
        shelter.latitude!,
        shelter.longitude!
      ),
    }))
    .filter((s) => s.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return sheltersWithDistance;
};

const updateLocation = async (
  userId: string,
  latitude: number,
  longitude: number
) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const updated = await prisma.shelter.update({
    where: { userId },
    data: { latitude, longitude },
  });

  return updated;
};

export const ShelterServices = {
  createShelterProfile,
  getMyShelterProfile,
  updateShelterProfile,
  getAllShelters,
  getShelterById,
  verifyShelter,
  getNearbyShelters,
  updateLocation,
};
