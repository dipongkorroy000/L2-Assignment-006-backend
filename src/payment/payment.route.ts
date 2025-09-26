import express from "express";
import { PaymentController } from "./payment.controller";
import { authorize } from "../middlewares/authorize";
import { Role } from "../modules/user/user.interface";

const router = express.Router();

router.post("/success", PaymentController.successPayment);
router.post("/fail", PaymentController.failPayment);
router.post("/cancel", PaymentController.cancelPayment);

router.post("/init-payment/:trackingId", PaymentController.nextTimePayment);

router.post("/init-payment-receiver/:trackingId", authorize(Role.receiver), PaymentController.nextTimePaymentReceiver);


router.post("/validate-payment", PaymentController.validatePayment);

router.get("/all-payments", authorize(Role.admin, Role.super_admin), PaymentController.getPayments);

router.get("/my-payments", authorize(...Object.values(Role)), PaymentController.userPayments);

export const PaymentRoutes = router;
