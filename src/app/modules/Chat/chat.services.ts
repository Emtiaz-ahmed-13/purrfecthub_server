import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const startConversation = async (userId: string, otherUserId: string) => {
  // Check if conversation already exists between these users
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, role: true },
          },
        },
      },
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  // Verify other user exists
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
  });

  if (!otherUser) {
    throw new ApiError(404, "User not found");
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, role: true },
          },
        },
      },
    },
  });

  return conversation;
};

const getMyConversations = async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, role: true },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  // Add unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          isRead: false,
        },
      });
      return { ...conv, unreadCount };
    })
  );

  return conversationsWithUnread;
};

const getConversationMessages = async (
  userId: string,
  conversationId: string,
  page = 1,
  limit = 50
) => {
  // Verify user is participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });

  if (!participant) {
    throw new ApiError(403, "Not a participant of this conversation");
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  return {
    messages: messages.reverse(),
    meta: { page, limit, total },
  };
};

const getUnreadCount = async (userId: string) => {
  const count = await prisma.message.count({
    where: {
      conversation: {
        participants: { some: { userId } },
      },
      senderId: { not: userId },
      isRead: false,
    },
  });

  return { unreadCount: count };
};

export const ChatServices = {
  startConversation,
  getMyConversations,
  getConversationMessages,
  getUnreadCount,
};
