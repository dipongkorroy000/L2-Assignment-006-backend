import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";
import { verifyJWTToken } from "../utils/jwt";
import CustomError from "../errorHelper/CustomError";

export const authorize =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization || req.cookies.accessToken;
      if (!accessToken) throw new CustomError(httpStatus.BAD_REQUEST, "No Token Received");

      const verifiedToken = verifyJWTToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;
      if (!verifiedToken) throw new CustomError(httpStatus.BAD_REQUEST, `Your are not authorized ${verifiedToken}`);

      const isUserExist = await User.findOne({ email: verifiedToken.email });
      if (!isUserExist) throw new CustomError(httpStatus.BAD_REQUEST, "Token unvalid");

      
      if (isUserExist.isActive === IsActive.blocked || isUserExist.isActive === IsActive.inActive) {
        throw new CustomError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`);
      }
      
      if (isUserExist.isDeleted) throw new CustomError(httpStatus.BAD_REQUEST, "User is Deleted");
      

      if (!authRoles.includes(verifiedToken.role))
        throw new CustomError(httpStatus.METHOD_NOT_ALLOWED, "Your are not permitted to parcel send request");

      req.token = verifiedToken;
      next();
    } catch (err) {
      next(err);
    }
  };
