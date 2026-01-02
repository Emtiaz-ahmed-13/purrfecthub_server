import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DonationServices } from "./donation.services";

const createDonation = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const donorId = req.user?.id || null;
    const result = await DonationServices.createDonation(donorId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Donation initiated successfully",
      data: result,
    });
  }
);

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { session_id } = req.body;
  const result = await DonationServices.verifyStripePayment(session_id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result.donation,
  });
});

const getMyDonations = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await DonationServices.getMyDonations(req.user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Donations retrieved successfully",
      data: result,
    });
  }
);

const getShelterDonations = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await DonationServices.getShelterDonations(req.user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Donations retrieved successfully",
      data: result,
    });
  }
);

const getDonationStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationServices.getDonationStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donation stats retrieved successfully",
    data: result,
  });
});

export const DonationControllers = {
  createDonation,
  verifyPayment,
  getMyDonations,
  getShelterDonations,
  getDonationStats,
};
