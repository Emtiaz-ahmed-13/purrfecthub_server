import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

type TRegisterUser = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  address?: string;
};

type TUpdateProfile = {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  homeType?: string;
  hasOtherPets?: boolean;
  otherPetsInfo?: string;
  experience?: string;
  aboutMe?: string;
};

const registerUser = async (payload: TRegisterUser) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || "ADOPTER",
      phone: payload.phone,
      address: payload.address,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      avatar: true,
      homeType: true,
      hasOtherPets: true,
      otherPetsInfo: true,
      experience: true,
      aboutMe: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      avatar: true,
      homeType: true,
      hasOtherPets: true,
      otherPetsInfo: true,
      experience: true,
      aboutMe: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const updateMyProfile = async (userId: string, payload: TUpdateProfile) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      avatar: true,
      homeType: true,
      hasOtherPets: true,
      otherPetsInfo: true,
      experience: true,
      aboutMe: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const getAllUsers = async (filters: {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { role, status, search, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (role) where.role = role;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        address: true,
        avatar: true,
        shelter: {
          select: {
            id: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
    },
  };
};

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Soft delete by setting status to BANNED
  await prisma.user.update({
    where: { id: userId },
    data: { status: "BANNED" },
  });

  return { message: "User deleted successfully" };
};

export const UserServices = {
  registerUser,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};
