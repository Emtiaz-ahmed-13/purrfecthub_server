import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { MedicalServices } from "./medical.services";

const createMedicalRecord = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await MedicalServices.createMedicalRecord(
      req.user.id,
      req.params.catId,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Medical record created successfully",
      data: result,
    });
  }
);

const getCatMedicalRecords = catchAsync(async (req: Request, res: Response) => {
  const result = await MedicalServices.getCatMedicalRecords(req.params.catId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Medical records retrieved successfully",
    data: result,
  });
});

const getMedicalRecordById = catchAsync(async (req: Request, res: Response) => {
  const result = await MedicalServices.getMedicalRecordById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Medical record retrieved successfully",
    data: result,
  });
});

const updateMedicalRecord = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await MedicalServices.updateMedicalRecord(
      req.user.id,
      req.params.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Medical record updated successfully",
      data: result,
    });
  }
);

const deleteMedicalRecord = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await MedicalServices.deleteMedicalRecord(
      req.user.id,
      req.params.id
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

const getUpcomingReminders = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await MedicalServices.getUpcomingReminders(req.user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Upcoming reminders retrieved successfully",
      data: result,
    });
  }
);

export const MedicalControllers = {
  createMedicalRecord,
  getCatMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getUpcomingReminders,
};
