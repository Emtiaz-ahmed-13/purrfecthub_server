import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ShelterServices } from "./shelter.services";

const createShelterProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ShelterServices.createShelterProfile(
      req.user.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Shelter profile created successfully",
      data: result,
    });
  }
);

const getMyShelterProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ShelterServices.getMyShelterProfile(req.user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Shelter profile retrieved successfully",
      data: result,
    });
  }
);

const updateShelterProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ShelterServices.updateShelterProfile(
      req.user.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Shelter profile updated successfully",
      data: result,
    });
  }
);

const getAllShelters = catchAsync(async (req: Request, res: Response) => {
  const { city, isVerified, search, page, limit } = req.query;

  const result = await ShelterServices.getAllShelters({
    city: city as string,
    isVerified: isVerified === "true" ? true : isVerified === "false" ? false : undefined,
    search: search as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shelters retrieved successfully",
    meta: result.meta,
    data: result.shelters,
  });
});

const getShelterById = catchAsync(async (req: Request, res: Response) => {
  const result = await ShelterServices.getShelterById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shelter retrieved successfully",
    data: result,
  });
});

const verifyShelter = catchAsync(async (req: Request, res: Response) => {
  const result = await ShelterServices.verifyShelter(
    req.params.id,
    req.body.isVerified
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Shelter ${result.isVerified ? "verified" : "unverified"} successfully`,
    data: result,
  });
});

const getNearbyShelters = catchAsync(async (req: Request, res: Response) => {
  const { latitude, longitude, maxDistance, limit } = req.query;

  if (!latitude || !longitude) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Latitude and longitude are required",
      data: null,
    });
  }

  const result = await ShelterServices.getNearbyShelters(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    maxDistance ? parseFloat(maxDistance as string) : undefined,
    limit ? parseInt(limit as string) : undefined
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Nearby shelters retrieved successfully",
    data: result,
  });
});

const updateLocation = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { latitude, longitude } = req.body;

    const result = await ShelterServices.updateLocation(
      req.user.id,
      latitude,
      longitude
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Location updated successfully",
      data: result,
    });
  }
);

export const ShelterControllers = {
  createShelterProfile,
  getMyShelterProfile,
  updateShelterProfile,
  getAllShelters,
  getShelterById,
  verifyShelter,
  getNearbyShelters,
  updateLocation,
};
