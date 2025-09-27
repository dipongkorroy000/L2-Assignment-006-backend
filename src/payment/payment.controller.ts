import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { envVars } from "../config/env";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { User } from "../modules/user/user.model";
import CustomError from "../errorHelper/CustomError";
import { Role } from "../modules/user/user.interface";

const successPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await PaymentService.successPayment(query as Record<string, string>);

  if (result.success) {
    res.redirect(
      `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
    );
  }
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await PaymentService.failPayment(query as Record<string, string>);

  if (!result.success) {
    res.redirect(
      `${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
    );
  }
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await PaymentService.cancelPayment(query as Record<string, string>);

  if (!result.success) {
    res.redirect(
      `${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
    );
  }
});

const nextTimePayment = catchAsync(async (req: Request, res: Response) => {
  const token = await req.token;
  const trackingId = await req.params.trackingId;
  const result = await PaymentService.nextTimePayment(trackingId, token);
  sendResponse(res, { status: 201, success: true, message: "Payment done successfully", data: result });
});

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  await SSLService.validatePayment(req.body);

  sendResponse(res, {
    status: 200,
    success: true,
    message: "Payment validated successfully",
    data: null,
  });
});

const getPayments = catchAsync(async (req: Request, res: Response) => {
  const query = await req.query;
  const token = await req.token;

  const user = await User.findById(token.userId);
  if (!user) throw new CustomError(401, "User not found");

  if (user.role === Role.admin || user.role === Role.super_admin) {
    const payments = await PaymentService.getPayments(query as Record<string, string>);

    sendResponse(res, { success: true, status: 200, message: "all payments", data: payments });
    return;
  } else {
    sendResponse(res, { success: true, status: 400, message: "not authorized", data: null });
  }
});

const userPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = await req.token.userId;

  const payments = await PaymentService.userPayments(userId);

  sendResponse(res, { success: true, status: 200, message: "Payments get successfully", data: payments });
});

export const PaymentController = {
  successPayment,
  failPayment,
  cancelPayment,
  nextTimePayment,
  validatePayment,
  getPayments,
  userPayments,
};
