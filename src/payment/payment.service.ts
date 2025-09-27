/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import CustomError from "../errorHelper/CustomError";
import { Parcel } from "../modules/parcel/parcel.model";
import { IParcel, Payment_Status } from "../modules/parcel/parcel.interface";
import { sendEmail } from "../utils/sendEmail";
import { generatePdf, IInvoiceData } from "../utils/invoice";
import { User } from "../modules/user/user.model";
import { uploadBufferToCloudinary } from "../config/cloudinary.config";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { QueryBuilder } from "../utils/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";

const successPayment = async (query: Record<string, string>) => {
  const session = await Parcel.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.PAID },
      { new: true, runValidators: true, session: session }
    );

    if (!updatedPayment) throw new CustomError(httpStatus.OK, "Payment not found");

    const updatedParcel = await Parcel.findByIdAndUpdate(
      updatedPayment?.parcel,
      { payment: Payment_Status.COMPLETE },
      { new: true, runValidators: true, session }
    );
    if (!updatedParcel) throw new CustomError(401, "Parcel not found");

    const senderInfo = await User.findById(updatedParcel?.senderId);
    if (!senderInfo) throw new CustomError(400, "User not found");

    const invoiceData: IInvoiceData = {
      deliveryDate: updatedPayment.createdAt as unknown as Date,
      totalAmount: updatedPayment.amount,
      tourTitle: (updatedParcel as unknown as IParcel).title,
      transactionId: updatedPayment.transactionId,
      userName: senderInfo.name as string,
    };
    const pdfBuffer = await generatePdf(invoiceData);

    const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, "invoice");

    if (!cloudinaryResult) throw new CustomError(401, "Error uploading pdf");

    await Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult.secure_url }, { runValidators: true, session });

    await sendEmail({
      to: senderInfo.email,
      subject: "Your Parcel Delivery Invoice",
      templateName: "invoice",
      templateData: invoiceData,
      attachments: [{ filename: "invoice.pdf", content: pdfBuffer, contentType: "application/pdf" }],
    });

    await session.commitTransaction();
    session.endSession();
    return { success: true, message: "Payment Completed Successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const failPayment = async (query: Record<string, string>) => {
  // Update Booking Status to FAIL
  // Update Payment Status to FAIL
  const session = await Parcel.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, { status: PAYMENT_STATUS.FAILED }, { session });

    await Parcel.findOneAndUpdate(
      { trackingId: updatedPayment?.transactionId },
      { payment: Payment_Status.FAILED },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: false, message: "Payment Failed" };

    // ---
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  // Update Booking Status to CANCEL
  // Update Payment Status to CANCEL

  const session = await Parcel.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, { status: PAYMENT_STATUS.CANCEL }, { session });

    await Parcel.findOneAndUpdate(
      { trackingId: updatedPayment?.transactionId },
      { payment: Payment_Status.CANCEL },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: false, message: "Payment Canceled" };

    // ---
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const nextTimePayment = async (trackingId: string, token: JwtPayload) => {
  const parcel = await Parcel.findOne({ trackingId });
  if (!parcel) throw new CustomError(httpStatus.NOT_FOUND, "Parcel Not Found. You have not parcel any payment");

  const userId = await token.userId;
  const user = await User.findById(userId);
  if (!user) throw new CustomError(401, "User not found");

  const payment = await Payment.findOne({ transactionId: trackingId });
  if (!payment) throw new CustomError(401, "Payment not found");

  if (payment.status === PAYMENT_STATUS.PAID && parcel.payment === Payment_Status.COMPLETE)
    throw new CustomError(httpStatus.BAD_REQUEST, "Delivery Charge already paid");

  const sslPayload: ISSLCommerz = {
    address: user.address,
    email: user.email,
    phoneNumber: user.phone as string,
    name: user.name,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return { paymentUrl: sslPayment.GatewayPageURL };
};


const getPayments = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Payment.find(), query);

  const payments = await queryBuilder.search(["transactionId", "status"]).filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([payments.build(), queryBuilder.getMeta()]);
  return { data, meta };
};

const userPayments = async (userId: string) => {
  const payments = await Payment.find({ userId });
  return payments;
};

export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
  nextTimePayment,
  getPayments,
  userPayments,
};
