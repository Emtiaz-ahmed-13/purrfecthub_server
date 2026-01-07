import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AITrainingServices } from './ai-training.service';

const createSuggestion = catchAsync(async (req: Request, res: Response) => {
    const result = await AITrainingServices.createSuggestion(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Suggestion submitted successfully!',
        data: result,
    });
});

const getAllSuggestions = catchAsync(async (req: Request, res: Response) => {
    const result = await AITrainingServices.getAllSuggestions();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Suggestions fetched successfully!',
        data: result,
    });
});

export const AITrainingControllers = {
    createSuggestion,
    getAllSuggestions,
};
