import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AdoptionServices } from "./adoption.services";

const submitAdoption = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await AdoptionServices.submitAdoption(req.user.id, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Adoption application submitted successfully",
      data: result,
    });
  }
);

const getMyAdoptions = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await AdoptionServices.getMyAdoptions(req.user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Adoptions retrieved successfully",
      data: result,
    });
  }
);

const getShelterAdoptions = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { status } = req.query;
    const result = await AdoptionServices.getShelterAdoptions(
      req.user.id,
      status as any
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Adoption applications retrieved successfully",
      data: result,
    });
  }
);

const reviewAdoption = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await AdoptionServices.reviewAdoption(
      req.user.id,
      req.params.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Application ${req.body.status.toLowerCase()} successfully`,
      data: result,
    });
  }
);

const completeAdoption = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await AdoptionServices.completeAdoption(
      req.user.id,
      req.params.id,
      req.body.status
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Adoption ${req.body.status.toLowerCase()} successfully`,
      data: result,
    });
  }
);

const getAdoptionById = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await AdoptionServices.getAdoptionById(
      req.params.id,
      req.user.id,
      req.user.role
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Adoption retrieved successfully",
      data: result,
    });
  }
);

export const AdoptionControllers = {
  submitAdoption,
  getMyAdoptions,
  getShelterAdoptions,
  reviewAdoption,
  completeAdoption,
  getAdoptionById,
};
