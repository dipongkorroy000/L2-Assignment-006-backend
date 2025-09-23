import { Request, Response } from "express";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import CustomError from "../../errorHelper/CustomError";
import { User } from "./user.model";
import { Role } from "./user.interface";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await UserService.createUser(payload);

  sendResponse(res, {
    status: status.CREATED,
    success: true,
    data: { name: result.name, email: result.email, phone: result?.phone },
    message: "User created successfully",
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.token;

  const result = await UserService.getMe(email as string);

  sendResponse(res, { status: status.OK, success: true, data: result, message: "User Retrieved successfully" });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const email = req.query.email;
  const user = await User.findOne({ email });
  if (!user) throw new CustomError(status.NOT_FOUND, "Not authorized");

  const token = req.token;
  const payload = await req.body;

  if (token.userId.toString() !== user._id.toString()) throw new CustomError(status.NOT_FOUND, "Not authorized");

  const result = await UserService.updateProfile(email as string, payload);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "profile updated successfully",
    data: { name: result?.name, email: result?.email, phone: result?.phone, address: result?.address },
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const token = req.token;
  const admin = await User.findOne({ email: token.email });
  if (!admin) throw new CustomError(status.NOT_FOUND, "Not authorized");
  if (token.userId.toString() !== admin._id.toString()) throw new CustomError(status.NOT_FOUND, "Not authorized");

  const result = await UserService.getAllUsers(token.userId);

  sendResponse(res, {
    success: true,
    status: status.OK,
    message: "All Users Retrieved Successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const token = req.token;
  const { email, role } = await req.body;

  const user = await User.findOne({ email: token.email });
  if (!user) throw new CustomError(status.NOT_FOUND, "Not authorized");

  if (token.userId.toString() !== user._id.toString()) throw new CustomError(status.NOT_FOUND, "Not authorized");

  if (token.role === Role.admin && role === Role.super_admin) throw new CustomError(status.NOT_FOUND, "Not authorized");
  if (user.role === Role.admin && role === Role.super_admin) throw new CustomError(status.NOT_FOUND, "Not authorized");

  if ((user.role === Role.admin || user.role === Role.super_admin) && (token.role === Role.admin || token.role === Role.super_admin)) {
    const result = await UserService.updateUserRole(email, role);
    sendResponse(res, { success: true, status: status.OK, message: "Update successfully", data: result });
  }
});

export const UserControllers = {
  createUser,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
};
