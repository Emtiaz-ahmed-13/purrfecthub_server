import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { CatServices } from "./cat.services";

import { FileUploadHelper } from "../../../helpers/fileUploadHelper";

const createCat = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    // Handle File Uploads
    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await FileUploadHelper.uploadToImageKit(file);
        if (uploadResult && uploadResult.url) {
          imageUrls.push(uploadResult.url);
        }
      }
    }

    // Add image URLs to payload
    // If 'images' provided in body is a string (from FormData), ignore/overwrite it if we have files
    // If no files uploaded, fallback to body.images if validation allows it (usually for testing)
    const catData = {
      ...req.body,
      images: imageUrls.length > 0 ? imageUrls : req.body.images
    };

    const result = await CatServices.createCat(req.user.id, catData);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Cat added successfully",
      data: result,
    });
  }
);

const getAllCats = catchAsync(async (req: Request, res: Response) => {
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
    page,
    limit,
    latitude,
    longitude,
    maxDistance,
  } = req.query;

  const result = await CatServices.getAllCats({
    breed: breed as string,
    gender: gender as any,
    status: status as any,
    minAge: minAge ? parseInt(minAge as string) : undefined,
    maxAge: maxAge ? parseInt(maxAge as string) : undefined,
    isVaccinated: isVaccinated === "true" ? true : isVaccinated === "false" ? false : undefined,
    isNeutered: isNeutered === "true" ? true : isNeutered === "false" ? false : undefined,
    shelterId: shelterId as string,
    city: city as string,
    search: search as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    latitude: latitude ? parseFloat(latitude as string) : undefined,
    longitude: longitude ? parseFloat(longitude as string) : undefined,
    maxDistance: maxDistance ? parseFloat(maxDistance as string) : undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cats retrieved successfully",
    meta: result.meta,
    data: result.cats,
  });
});

const getCatById = catchAsync(async (req: Request, res: Response) => {
  const result = await CatServices.getCatById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cat retrieved successfully",
    data: result,
  });
});

const updateCat = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await CatServices.updateCat(
      req.user.id,
      req.params.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cat updated successfully",
      data: result,
    });
  }
);

const deleteCat = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const isAdmin = req.user.role === "ADMIN";
    const result = await CatServices.deleteCat(req.user.id, req.params.id, isAdmin);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

const getMyShelterCats = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { status, page, limit } = req.query;

    const result = await CatServices.getMyShelterCats(req.user.id, {
      status: status as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Shelter cats retrieved successfully",
      meta: result.meta,
      data: result.cats,
    });
  }
);

export const CatControllers = {
  createCat,
  getAllCats,
  getCatById,
  updateCat,
  deleteCat,
  getMyShelterCats,
};
