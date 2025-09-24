/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import CustomError from "../../errorHelper/CustomError";
import { getTransactionId } from "../../utils/generateId";
import { User } from "../user/user.model";
import { IParcel, Payment_Status, Status, StatusLog, TParcelStatusLog } from "./parcel.interface";
import status from "http-status-codes";
import { Parcel } from "./parcel.model";
import { ISSLCommerz } from "../../sslCommerz/sslCommerz.interface";
import { SSLService } from "../../sslCommerz/sslCommerz.service";
import { Payment } from "../../payment/payment.model";
import { PAYMENT_STATUS } from "../../payment/payment.interface";
import { Types } from "mongoose";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { strike } from "pdfkit/js/mixins/annotations";

const parcelRequest = async (payload: Partial<IParcel>) => {
  const session = await Parcel.startSession();
  session.startTransaction();

  try {
    const { senderId, weight = 1, receiverEmail, ...rest } = payload;

    const senderInfo = await User.findById(senderId);
    if (!senderInfo) throw new CustomError(status.NOT_FOUND, "User not found");
    if (!senderInfo.isVerified) throw new CustomError(status.BAD_REQUEST, "Please verified your profile");

    if (!senderInfo.phone || !senderInfo.address)
      throw new CustomError(status.BAD_REQUEST, "Please Update Your Profile to Parcel Request And Must be add Phone & Address.");

    if (receiverEmail) {
      const receiver = await User.findOne({ email: receiverEmail });
      if (!receiver) throw new CustomError(401, "Receiver not found");
    }

    const trackingId = getTransactionId();

    const parcel = await Parcel.create([{ ...payload, trackingId: trackingId }], { session });

    const amount = 100 * weight;

    await Payment.create([{ parcel: parcel[0]._id, transactionId: trackingId, amount: amount, status: PAYMENT_STATUS.UNPAID }], {
      session,
    });

    const sslPayload: ISSLCommerz = {
      name: senderInfo.name,
      phoneNumber: senderInfo.phone as string,
      transactionId: trackingId,
      email: senderInfo.email,
      amount: amount,
      address: senderInfo.address,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    await session.commitTransaction();
    session.endSession();

    return sslPayment.redirectGatewayURL;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  // return parcel;
};

const parcelStatusUpdate = async (adminName: string, trackingId: string, payload: TParcelStatusLog) => {
  if (!payload.location || !payload.note || !payload.status) {
    throw new CustomError(status.BAD_REQUEST, "More Data Needed");
  }

  const parcel = await Parcel.findOne({ trackingId });

  if (!parcel) throw new CustomError(status.BAD_REQUEST, "Parcel Not Found");

  if (parcel.statusLog && parcel.statusLog.length > 0) {
    const status = parcel?.statusLog[parcel?.statusLog.length - 1].status;
    if(status === payload.status) throw new CustomError(401, `Already this parcel status ${status}`)
  }

  const statusLog: StatusLog = {
    updatedBy: adminName,
    location: payload.location,
    note: payload.note,
    status: payload.status,
    timestamp: new Date(),
  };

  parcel.statusLog?.push(statusLog);

  const updatedParcel = await parcel.save();

  return updatedParcel;
};

const senderParcels = async (senderId: string) => {
  const parcels = await Parcel.find({ senderId });
  return parcels;
};

const receiverIncomingParcel = async (receiverId: Types.ObjectId) => {
  const parcels = await Parcel.find({ receiverId }).select("-_id -senderId -receiverId");
  return parcels;
};

const singleParcel = async (trackingId: string) => {
  const result = await Parcel.findOne({ trackingId }).select("statusLog -_id title");
  return result;
};

const confirmParcel = async (trackingId: string, phone: string | undefined, email: string | undefined) => {
  const parcel = await Parcel.findOne({ trackingId });
  if (!parcel) throw new CustomError(401, "Parcel not found");
  if (parcel.payment !== Payment_Status.COMPLETE) throw new CustomError(status.BAD_REQUEST, "Payment must be completed");

  if (email && parcel.receiverEmail) {
    const receiver = await User.findOne({ email });
    if (!receiver) throw new CustomError(401, "Receiver not found");

    // console.log(typeof receiver._id); // 'object'
    // console.log(typeof parcel.receiverId); // 'object' or 'string'
    // solution ->  .toString()

    if (!receiver) throw new CustomError(401, "User Not Found");
    if (!receiver.phone) throw new CustomError(401, "Please update your profile , must be add phone number");

    if (receiver.email !== parcel.receiverEmail) throw new CustomError(status.NOT_ACCEPTABLE, "Parcel not valied this receiver");

    const result = await Parcel.updateOne({ trackingId }, { status: Status.picked });

    return result;
  } else if (phone && parcel.receiverNumber) {
    if (phone !== parcel.receiverNumber) throw new CustomError(status.NOT_ACCEPTABLE, "Parcel not valied this receiver");

    const result = await Parcel.updateOne({ trackingId }, { status: Status.picked });

    return result;
  }

  throw new CustomError(status.NOT_ACCEPTABLE, "Please provide receiver email or phone");
};

const deleteParcel = async (trackingId: string) => {
  const result = await Parcel.deleteOne({ trackingId });
  return result;
};

const allParcels = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Parcel.find(), query);

  const parcels = await queryBuilder.search(["division", "trackingId", "status", "payment"]).filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([parcels.build(), queryBuilder.getMeta()]);
  return { data, meta };
};

export const parcelService = {
  parcelRequest,
  parcelStatusUpdate,
  senderParcels,
  deleteParcel,
  allParcels,
  singleParcel,
  confirmParcel,
  receiverIncomingParcel,
};
