import { Server as HttpServer } from "http";
import { Secret } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import prisma from "./app/shared/prisma";
import config from "./config";
import { jwtHelpers } from "./helpers/jwtHelpers";

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwtHelpers.verifyToken(
        token.replace("Bearer ", ""),
        config.jwt.jwt_secret as Secret
      );

      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user.id;
    console.log(`User connected: ${userId}`);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Join a conversation
    socket.on("join-conversation", async (conversationId: string) => {
      // Verify user is participant
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
      });

      if (participant) {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
      }
    });

    // Send message
    socket.on("send-message", async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;

        // Verify user is participant
        const participant = await prisma.conversationParticipant.findFirst({
          where: { conversationId, userId },
        });

        if (!participant) {
          socket.emit("error", { message: "Not a participant of this conversation" });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content,
          },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

        // Update conversation
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessage: content,
            lastMessageAt: new Date(),
          },
        });

        // Emit to all participants in the conversation
        io.to(`conversation:${conversationId}`).emit("new-message", message);

        // Notify other participants
        const participants = await prisma.conversationParticipant.findMany({
          where: { conversationId, userId: { not: userId } },
        });

        participants.forEach((p) => {
          io.to(`user:${p.userId}`).emit("message-notification", {
            conversationId,
            message,
          });
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("mark-read", async (conversationId: string) => {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: { isRead: true },
      });

      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: { conversationId, userId },
        },
        data: { lastReadAt: new Date() },
      });
    });

    // Typing indicator
    socket.on("typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("user-typing", {
        conversationId,
        userId,
      });
    });

    socket.on("stop-typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("user-stop-typing", {
        conversationId,
        userId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
