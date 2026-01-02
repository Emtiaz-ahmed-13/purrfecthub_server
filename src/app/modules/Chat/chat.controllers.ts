import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ChatServices } from "./chat.services";

const startConversation = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ChatServices.startConversation(
      req.user.id,
      req.body.userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Conversation started",
      data: result,
    });
  }
);

const getMyConversations = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ChatServices.getMyConversations(req.user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Conversations retrieved",
      data: result,
    });
  }
);

const getConversationMessages = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { page, limit } = req.query;

    const result = await ChatServices.getConversationMessages(
      req.user.id,
      req.params.id,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Messages retrieved",
      meta: result.meta,
      data: result.messages,
    });
  }
);

const getUnreadCount = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ChatServices.getUnreadCount(req.user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Unread count retrieved",
      data: result,
    });
  }
);

export const ChatControllers = {
  startConversation,
  getMyConversations,
  getConversationMessages,
  getUnreadCount,
};
