import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AdminServices } from "./admin.services";

const getAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAnalytics();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Analytics retrieved successfully",
        data: result,
    });
});

export const AdminControllers = {
    getAnalytics
};
