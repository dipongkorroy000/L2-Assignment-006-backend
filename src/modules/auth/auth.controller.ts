import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import CustomError from "../../errorHelper/CustomError";
import { setAuthCookie } from "../../utils/setCookie";

const credentialLogin = catchAsync(async (req: Request, res: Response) => {
  const loginInfo = await AuthService.credentialLogin(req.body, res);

  sendResponse(res, { status: httpStatus.OK, success: true, message: "Login Successfully", data: loginInfo });
  // ---
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", { httpOnly: true, secure: false, sameSite: "lax" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: false, sameSite: "lax" });

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Logout Successfully",
    data: null,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new CustomError(httpStatus.BAD_REQUEST, "No refresh token recieved from cookies")
    }
    const tokenInfo = await AuthService.getNewAccessToken(refreshToken as string)

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: "New Access Token Retrieved Successfully",
        data: tokenInfo,
    })
})

export const AuthController = { credentialLogin, logout, getNewAccessToken };
