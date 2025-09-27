import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { parcelService } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";
import statusCode from "http-status-codes";
import { User } from "../user/user.model";
import CustomError from "../../errorHelper/CustomError";
import status from "http-status-codes";

const parcelRequest = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await parcelService.parcelRequest(payload);

  sendResponse(res, { status: statusCode.OK, success: true, message: "parcel deliver requested successfully", data: result });
});

const parcelStatusUpdate = catchAsync(async (req: Request, res: Response) => {
  const token = req.token;
  const trackingId = req.params.trackingId;
  const payload = await req.body;

  const admin = await User.findOne({ email: token.email });
  if (!admin) throw new CustomError(status.BAD_REQUEST, "User Not Found");
  if (token.role !== admin.role) throw new CustomError(status.UNAUTHORIZED, "Unauthorized user");

  const result = await parcelService.parcelStatusUpdate(admin.name, trackingId, payload);

  sendResponse(res, { status: status.OK, success: true, message: "Parcel Updated Successfully", data: result });
  // -----
});

const deleteParcel = catchAsync(async (req: Request, res: Response) => {
  const trackingId = req.params.trackingId;
  const result = await parcelService.deleteParcel(trackingId);
  sendResponse(res, { status: status.OK, success: true, message: "Delete the parcel", data: result });
});

const myParcels = catchAsync(async (req: Request, res: Response) => {
  const userId = req.token.userId;
  const result = await parcelService.myParcels(userId);
  sendResponse(res, { status: status.OK, success: true, message: "My Parcels retrieved successfully", data: result });
});

const receiverIncomingParcel = catchAsync(async (req: Request, res: Response) => {
  const token = await req.token;
  const user = await User.findById(token.userId);

  if (!user) throw new CustomError(statusCode.NOT_FOUND, "Not authorized");
  if (token.userId.toString() !== user._id.toString()) throw new CustomError(statusCode.NOT_FOUND, "Not authorized");

  const result = await parcelService.receiverIncomingParcel(user.email);

  sendResponse(res, { status: status.OK, success: true, data: result, message: "incoming parcel retrieved successfully" });
});

const singleParcel = async (req: Request, res: Response) => {
  const trackingId = req.params.trackingId;
  const result = await parcelService.singleParcel(trackingId);
  sendResponse(res, { status: status.OK, success: true, message: "Incoming parcels retrieved successfully", data: result });
};

const confirmParcel = catchAsync(async (req: Request, res: Response) => {
  const { trackingId, phone, email } = req.body;
  const result = await parcelService.confirmParcel(trackingId, phone, email);
  sendResponse(res, { status: status.OK, success: true, message: "Parcel confirm", data: result });
});

const allParcels = catchAsync(async (req: Request, res: Response) => {
  const query = await req.query;
  const token = req.token;
  const admin = await User.findOne({ email: token.email });
  if (!admin) throw new CustomError(statusCode.NOT_FOUND, "Not authorized");
  if (token.userId.toString() !== admin._id.toString()) throw new CustomError(statusCode.NOT_FOUND, "Not authorized");

  const result = await parcelService.allParcels(query as Record<string, string>);
  sendResponse(res, { status: status.OK, success: true, message: "All Parcels retrieved successfuly", data: result });
});

export const parcelController = {
  parcelRequest,
  parcelStatusUpdate,
  myParcels,
  deleteParcel,
  allParcels,
  receiverIncomingParcel,
  singleParcel,
  confirmParcel,
};
