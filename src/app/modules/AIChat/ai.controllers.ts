import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AIServices } from './ai.service';

const chatWithAI = catchAsync(async (req: Request, res: Response) => {
    const { message } = req.body;
    const result = await AIServices.getAIResponse(message);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'AI response retrieved successfully',
        data: result,
    });
});

export const AIControllers = {
    chatWithAI,
};
