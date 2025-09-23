import crypto from "crypto";
import CustomError from "../errorHelper/CustomError";
import { sendEmail } from "../utils/sendEmail";
import { User } from "../modules/user/user.model";
import { redisClient } from "../config/redis.config";

const OTP_EXPIRATION = 2 * 60; // 2minute

const generateOtp = (length = 6) => {
  // default 6 digit otp
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};

const sendOTP = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new CustomError(401, "User not found");
  if (user.isVerified) throw new CustomError(401, "You are already verified");

  const otp = generateOtp();

  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "verification",
    templateData: { name: user.name, otp: otp },
  });
};

const verifyOTP = async (email: string, otp: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new CustomError(401, "User not found");
  if (user.isVerified) throw new CustomError(401, "You are already verified");

  const redisKey = `otp:${email}`;
  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp) throw new CustomError(401, "Invalid OTP");
  if (savedOtp !== otp) throw new CustomError(401, "Invalid OTP");

  await Promise.all([await User.updateOne({ email }, { isVerified: true }, { runValidators: true }), await redisClient.del([redisKey])]);
};

export const OTPService = { sendOTP, verifyOTP };
