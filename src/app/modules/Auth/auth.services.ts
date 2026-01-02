import bcrypt from "bcrypt";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { findUserByEmail } from "../../../helpers/userHelpers";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

type TLogin = {
  email: string;
  password: string;
};

type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};

const login = async (payload: TLogin) => {
  const { email, password } = payload;

  const user = await findUserByEmail(email);

  // Check if user is active
  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "Your account is not active. Please contact support.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid Credentials.");

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    accessToken,
    refreshToken,
    user: userWithoutPassword,
  };
};

const refreshToken = async (token: string) => {
  // Verify refresh token
  let verifiedToken;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Check if user still exists
  const user = await prisma.user.findUnique({
    where: { id: verifiedToken.id },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "Your account is not active");
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate new access token
  const newAccessToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (userId: string, payload: TChangePassword) => {
  const { oldPassword, newPassword } = payload;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};

export const AuthServices = {
  login,
  refreshToken,
  changePassword,
};
