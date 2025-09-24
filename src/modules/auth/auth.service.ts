/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import CustomError from "../../errorHelper/CustomError";
import bcrypt from "bcryptjs";
import { User } from "../user/user.model";
import { createUserTokens } from "../../utils/generateToken";
import { IUser } from "../user/user.interface";
import { setAuthCookie } from "../../utils/setCookie";
import { Response } from "express";

const credentialLogin = async (payload: Partial<IUser>, res: Response) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });
  if (!isUserExist) throw new CustomError(httpStatus.BAD_REQUEST, "Email does not exist");

  if (isUserExist.isDeleted) throw new CustomError(httpStatus.BAD_REQUEST, "Email id Deleted");

  const isPasswordMatched = await bcrypt.compare(password as string, isUserExist.password as string);
  if (!isPasswordMatched) throw new CustomError(httpStatus.BAD_REQUEST, "Incorrect Password");

  const userTokens = createUserTokens(isUserExist);

  setAuthCookie(res, userTokens);

  const { password: pass, ...rest } = isUserExist.toObject();

  return { accessToken: userTokens.accessToken, refreshToken: userTokens.refreshToken, user: rest };
};

export const AuthService = { credentialLogin };
