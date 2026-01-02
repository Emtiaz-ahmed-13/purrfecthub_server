import { AdoptionStatus } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

type TSubmitAdoption = {
  catId: string;
  message?: string;
  homeType?: string;
  hasOtherPets?: boolean;
  otherPetsInfo?: string;
  experience?: string;
};

type TReviewAdoption = {
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  reviewNotes?: string;
};

const submitAdoption = async (adopterId: string, payload: TSubmitAdoption) => {
  // Check if cat exists and is available
  const cat = await prisma.cat.findUnique({
    where: { id: payload.catId },
    include: { shelter: true },
  });

  if (!cat) {
    throw new ApiError(404, "Cat not found");
  }

  if (cat.status !== "AVAILABLE") {
    throw new ApiError(400, "This cat is not available for adoption");
  }

  // Check if user already has a pending application for this cat
  const existingApplication = await prisma.adoption.findFirst({
    where: {
      catId: payload.catId,
      adopterId,
      status: { in: ["PENDING", "UNDER_REVIEW"] },
    },
  });

  if (existingApplication) {
    throw new ApiError(400, "You already have a pending application for this cat");
  }

  const adoption = await prisma.adoption.create({
    data: {
      ...payload,
      adopterId,
    },
    include: {
      cat: {
        select: {
          id: true,
          name: true,
          breed: true,
          images: true,
        },
      },
    },
  });

  // Update cat status to pending
  await prisma.cat.update({
    where: { id: payload.catId },
    data: { status: "PENDING" },
  });

  return adoption;
};

const getMyAdoptions = async (adopterId: string) => {
  const adoptions = await prisma.adoption.findMany({
    where: { adopterId },
    orderBy: { createdAt: "desc" },
    include: {
      cat: {
        include: {
          shelter: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
        },
      },
    },
  });

  return adoptions;
};

const getShelterAdoptions = async (userId: string, status?: AdoptionStatus) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const where: any = {
    cat: { shelterId: shelter.id },
  };

  if (status) where.status = status;

  const adoptions = await prisma.adoption.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      cat: {
        select: {
          id: true,
          name: true,
          breed: true,
          images: true,
        },
      },
      adopter: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  });

  return adoptions;
};

const reviewAdoption = async (
  userId: string,
  adoptionId: string,
  payload: TReviewAdoption
) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const adoption = await prisma.adoption.findUnique({
    where: { id: adoptionId },
    include: { cat: true },
  });

  if (!adoption) {
    throw new ApiError(404, "Adoption application not found");
  }

  if (adoption.cat.shelterId !== shelter.id) {
    throw new ApiError(403, "This application is not for your shelter");
  }

  if (!["PENDING", "UNDER_REVIEW"].includes(adoption.status)) {
    throw new ApiError(400, "This application has already been processed");
  }

  const updated = await prisma.adoption.update({
    where: { id: adoptionId },
    data: {
      status: payload.status,
      reviewNotes: payload.reviewNotes,
      reviewedAt: new Date(),
    },
    include: {
      cat: true,
      adopter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Update cat status based on adoption status
  if (payload.status === "APPROVED") {
    await prisma.cat.update({
      where: { id: adoption.catId },
      data: { status: "PENDING" }, // Still pending until completed
    });
  } else if (payload.status === "REJECTED") {
    // Check if there are other pending applications
    const otherApplications = await prisma.adoption.count({
      where: {
        catId: adoption.catId,
        id: { not: adoptionId },
        status: { in: ["PENDING", "UNDER_REVIEW", "APPROVED"] },
      },
    });

    if (otherApplications === 0) {
      await prisma.cat.update({
        where: { id: adoption.catId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  // Create notification for adopter
  await prisma.notification.create({
    data: {
      userId: adoption.adopterId,
      title: `Adoption Application ${payload.status.toLowerCase()}`,
      message: `Your adoption application for ${adoption.cat.name} has been ${payload.status.toLowerCase()}.`,
      type: "ADOPTION_UPDATE",
    },
  });

  return updated;
};

const completeAdoption = async (
  userId: string,
  adoptionId: string,
  status: "COMPLETED" | "CANCELLED"
) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const adoption = await prisma.adoption.findUnique({
    where: { id: adoptionId },
    include: { cat: true },
  });

  if (!adoption) {
    throw new ApiError(404, "Adoption application not found");
  }

  if (adoption.cat.shelterId !== shelter.id) {
    throw new ApiError(403, "This application is not for your shelter");
  }

  if (adoption.status !== "APPROVED") {
    throw new ApiError(400, "Only approved applications can be completed");
  }

  const updated = await prisma.adoption.update({
    where: { id: adoptionId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  // Update cat status
  await prisma.cat.update({
    where: { id: adoption.catId },
    data: { status: status === "COMPLETED" ? "ADOPTED" : "AVAILABLE" },
  });

  return updated;
};

const getAdoptionById = async (id: string, userId: string, userRole: string) => {
  const adoption = await prisma.adoption.findUnique({
    where: { id },
    include: {
      cat: {
        include: {
          shelter: true,
          medicalRecords: true,
        },
      },
      adopter: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  });

  if (!adoption) {
    throw new ApiError(404, "Adoption not found");
  }

  // Check access - adopter can only see their own, shelter can see theirs
  if (userRole === "ADOPTER" && adoption.adopterId !== userId) {
    throw new ApiError(403, "Access denied");
  }

  if (userRole === "SHELTER") {
    const shelter = await prisma.shelter.findUnique({ where: { userId } });
    if (!shelter || adoption.cat.shelterId !== shelter.id) {
      throw new ApiError(403, "Access denied");
    }
  }

  return adoption;
};

export const AdoptionServices = {
  submitAdoption,
  getMyAdoptions,
  getShelterAdoptions,
  reviewAdoption,
  completeAdoption,
  getAdoptionById,
};
