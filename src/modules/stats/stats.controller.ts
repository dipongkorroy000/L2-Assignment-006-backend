// controllers/stats.controller.ts
import {Request, Response} from "express";
import {catchAsync} from "../../utils/catchAsync";
import {sendResponse} from "../../utils/sendResponse";
import {StatsService} from "./stats.service";

const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getPaymentStats();
  sendResponse(res, {
    status: 200,
    success: true,
    message: "Payment stats fetched successfully",
    data: stats,
  });
});

const getParcelStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.parcelStats();
  sendResponse(res, {
    status: 200,
    success: true,
    message: "User stats fetched successfully",
    data: stats,
  });
});

const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getUserStats();
  sendResponse(res, {
    status: 200,
    success: true,
    message: "User stats fetched successfully",
    data: stats,
  });
});

const getSenderStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getSenderStats(req.token.email as string);
  sendResponse(res, {
    status: 200,
    success: true,
    message: "User stats fetched successfully",
    data: stats,
  });
});

export const StatsController = {getUserStats, getParcelStats, getPaymentStats, getSenderStats};
