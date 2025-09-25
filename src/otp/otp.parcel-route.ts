// src/modules/otp/otp.routes.ts
import express from "express";
import { OTPController } from "./otp.controller";
import { authorize } from "../middlewares/authorize";
import { Role } from "../modules/user/user.interface";

const router = express.Router();

router.post("/parcel-otp-send", authorize(Role.sender, Role.admin), OTPController.sendOTP);
router.post("/parcel-otp-verify", OTPController.verifyOTP);

export const ParcelVerificationRoutes = router;
