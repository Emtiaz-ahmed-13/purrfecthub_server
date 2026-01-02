import { RecordType } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

type TCreateMedicalRecord = {
  type: RecordType;
  title: string;
  description?: string;
  veterinarian?: string;
  clinic?: string;
  date: string;
  nextDueDate?: string;
  documents?: string[];
  cost?: number;
};

type TUpdateMedicalRecord = Partial<TCreateMedicalRecord>;

const createMedicalRecord = async (
  userId: string,
  catId: string,
  payload: TCreateMedicalRecord
) => {
  // Verify shelter owns this cat
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const cat = await prisma.cat.findUnique({
    where: { id: catId },
  });

  if (!cat) {
    throw new ApiError(404, "Cat not found");
  }

  if (cat.shelterId !== shelter.id) {
    throw new ApiError(403, "You can only add records to your shelter's cats");
  }

  const record = await prisma.medicalRecord.create({
    data: {
      ...payload,
      catId,
      date: new Date(payload.date),
      nextDueDate: payload.nextDueDate ? new Date(payload.nextDueDate) : null,
    },
    include: {
      cat: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update cat vaccination status if it's a vaccination record
  if (payload.type === "VACCINATION") {
    await prisma.cat.update({
      where: { id: catId },
      data: { isVaccinated: true },
    });
  }

  return record;
};

const getCatMedicalRecords = async (catId: string) => {
  const cat = await prisma.cat.findUnique({
    where: { id: catId },
  });

  if (!cat) {
    throw new ApiError(404, "Cat not found");
  }

  const records = await prisma.medicalRecord.findMany({
    where: { catId },
    orderBy: { date: "desc" },
  });

  return records;
};

const getMedicalRecordById = async (id: string) => {
  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: {
      cat: {
        include: {
          shelter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!record) {
    throw new ApiError(404, "Medical record not found");
  }

  return record;
};

const updateMedicalRecord = async (
  userId: string,
  recordId: string,
  payload: TUpdateMedicalRecord
) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
    include: { cat: true },
  });

  if (!record) {
    throw new ApiError(404, "Medical record not found");
  }

  if (record.cat.shelterId !== shelter.id) {
    throw new ApiError(403, "You can only update records for your shelter's cats");
  }

  const updated = await prisma.medicalRecord.update({
    where: { id: recordId },
    data: {
      ...payload,
      date: payload.date ? new Date(payload.date) : undefined,
      nextDueDate: payload.nextDueDate ? new Date(payload.nextDueDate) : undefined,
    },
  });

  return updated;
};

const deleteMedicalRecord = async (userId: string, recordId: string) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
    include: { cat: true },
  });

  if (!record) {
    throw new ApiError(404, "Medical record not found");
  }

  if (record.cat.shelterId !== shelter.id) {
    throw new ApiError(403, "You can only delete records for your shelter's cats");
  }

  await prisma.medicalRecord.delete({
    where: { id: recordId },
  });

  return { message: "Medical record deleted successfully" };
};

const getUpcomingReminders = async (userId: string) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const reminders = await prisma.medicalRecord.findMany({
    where: {
      cat: { shelterId: shelter.id },
      nextDueDate: {
        gte: now,
        lte: thirtyDaysFromNow,
      },
    },
    orderBy: { nextDueDate: "asc" },
    include: {
      cat: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return reminders;
};

export const MedicalServices = {
  createMedicalRecord,
  getCatMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getUpcomingReminders,
};
