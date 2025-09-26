import crypto from "crypto";
import CustomError from "../errorHelper/CustomError";
import { sendEmail } from "../utils/sendEmail";
import { User } from "../modules/user/user.model";
import { redisClient } from "../config/redis.config";
import { Parcel } from "../modules/parcel/parcel.model";
import { Status, TParcelStatusLog } from "../modules/parcel/parcel.interface";

const OTP_EXPIRATION = 2 * 60; // 2minute

const generateOtp = (length = 6) => {
  // default 6 digit otp
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};

const sendOTP = async (trackingId: string) => {
  const otp = generateOtp();

  const parcel = await Parcel.findOne({trackingId: trackingId });

  if (!parcel) throw new CustomError(401, "Parcel not found");

  if ((parcel.statusLog as object[]).length > 1) {
    const obj = (parcel.statusLog as object[])[(parcel.statusLog as object[]).length - 1] as Partial<TParcelStatusLog>;
    throw new CustomError(400, `The Parcel has been ${obj.status}`);
  }

  const user = await User.findById(parcel.senderId);
  if (!user) throw new CustomError(401, "User not found");

  const redisKey = `otp:${trackingId}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: user.email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: { name: user.name, parcel: parcel.title, otp: otp },
  });
};

const verifyOTP = async (trackingId: string, otp: string) => {
  const redisKey = `otp:${trackingId}`;
  const savedOtp = await redisClient.get(redisKey);
  if (!savedOtp) throw new CustomError(401, "Invalid OTP");
  if (savedOtp !== otp) throw new CustomError(401, "Invalid OTP");

  await Promise.all([await Parcel.updateOne({ trackingId }, { status: Status.cancel }, { runValidators: true }), await redisClient.del([redisKey])]);
};

export const OTPService = { sendOTP, verifyOTP };
