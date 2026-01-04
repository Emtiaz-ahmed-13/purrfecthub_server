import { CatStatus, Gender } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

type TCreateCat = {
  name: string;
  breed: string;
  age: number;
  gender: Gender;
  color: string;
  weight?: number;
  description?: string;
  images?: string[];
  isVaccinated?: boolean;
  isNeutered?: boolean;
  specialNeeds?: string;
};

type TUpdateCat = Partial<TCreateCat> & {
  status?: CatStatus;
};

type TCatFilters = {
  breed?: string;
  gender?: Gender;
  status?: CatStatus;
  minAge?: number;
  maxAge?: number;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  shelterId?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const createCat = async (userId: string, payload: TCreateCat) => {
  // Get shelter for this user
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found. Please create a shelter profile first.");
  }

  const cat = await prisma.cat.create({
    data: {
      ...payload,
      shelterId: shelter.id,
    },
    include: {
      shelter: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
    },
  });

  return cat;
};

const getAllCats = async (filters: TCatFilters) => {
  const {
    breed,
    gender,
    status,
    minAge,
    maxAge,
    isVaccinated,
    isNeutered,
    shelterId,
    city,
    search,
    page = 1,
    limit = 12,
    latitude,
    longitude,
    maxDistance = 10,
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (breed) where.breed = { contains: breed, mode: "insensitive" };
  if (gender) where.gender = gender;
  if (status) where.status = status;
  else where.status = "AVAILABLE"; // Default to available cats

  if (minAge !== undefined) where.age = { ...where.age, gte: minAge };
  if (maxAge !== undefined) where.age = { ...where.age, lte: maxAge };
  if (isVaccinated !== undefined) where.isVaccinated = isVaccinated;
  if (isNeutered !== undefined) where.isNeutered = isNeutered;
  if (shelterId) where.shelterId = shelterId;

  if (city) {
    where.shelter = { city: { contains: city, mode: "insensitive" } };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { breed: { contains: search, mode: "insensitive" } },
      { color: { contains: search, mode: "insensitive" } },
    ];
  }

  const [cats, total] = await Promise.all([
    prisma.cat.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
            city: true,
            isVerified: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    }),
    prisma.cat.count({ where }),
  ]);

  let finalCats = cats;

  // Filter by distance if lat/long are provided
  if (latitude && longitude) {
    finalCats = cats.filter((cat) => {
      if (!cat.shelter.latitude || !cat.shelter.longitude) return false;
      const distance = calculateDistance(
        latitude,
        longitude,
        cat.shelter.latitude,
        cat.shelter.longitude
      );
      return distance <= maxDistance;
    });
  }

  return {
    cats: finalCats,
    meta: { page, limit, total: finalCats.length }, // Update total for current page, ideally should refetch count but this is a reasonable approximation for "nearby" filter on fetched set
  };
};

const getCatById = async (id: string) => {
  const cat = await prisma.cat.findUnique({
    where: { id },
    include: {
      shelter: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          phone: true,
          email: true,
          isVerified: true,
        },
      },
      medicalRecords: {
        orderBy: { date: "desc" },
        take: 5,
      },
      _count: {
        select: {
          adoptions: true,
          medicalRecords: true,
        },
      },
    },
  });

  if (!cat) {
    throw new ApiError(404, "Cat not found");
  }

  return cat;
};

const updateCat = async (userId: string, catId: string, payload: TUpdateCat) => {
  // Get shelter for this user
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  // Check if cat belongs to this shelter
  const cat = await prisma.cat.findUnique({
    where: { id: catId },
  });

  if (!cat) {
    throw new ApiError(404, "Cat not found");
  }

  if (cat.shelterId !== shelter.id) {
    throw new ApiError(403, "You can only update cats from your shelter");
  }

  const updated = await prisma.cat.update({
    where: { id: catId },
    data: payload,
    include: {
      shelter: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
    },
  });

  return updated;
};

const deleteCat = async (userId: string, catId: string, isAdmin: boolean) => {
  const cat = await prisma.cat.findUnique({
    where: { id: catId },
    include: { shelter: true },
  });

  if (!cat) {
    throw new ApiError(404, "Cat not found");
  }

  // Admin can delete any cat
  if (!isAdmin) {
    const shelter = await prisma.shelter.findUnique({
      where: { userId },
    });

    if (!shelter || cat.shelterId !== shelter.id) {
      throw new ApiError(403, "You can only delete cats from your shelter");
    }
  }

  await prisma.cat.delete({
    where: { id: catId },
  });

  return { message: "Cat deleted successfully" };
};

const getMyShelterCats = async (userId: string, filters: TCatFilters) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  return getAllCats({ ...filters, shelterId: shelter.id, status: filters.status });
};

export const CatServices = {
  createCat,
  getAllCats,
  getCatById,
  updateCat,
  deleteCat,
  getMyShelterCats,
};
