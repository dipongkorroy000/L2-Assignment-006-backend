import express from "express";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";
import { authorize } from "../../middlewares/authorize";

const router = express.Router();

router.get("/user", authorize(Role.admin, Role.super_admin), StatsController.getUserStats);
router.get("/parcel", authorize(Role.admin, Role.super_admin), StatsController.getParcelStats);
router.get("/payment", authorize(Role.admin, Role.super_admin), StatsController.getPaymentStats);

router.get("/sender", authorize(Role.sender), StatsController.getSenderStats);

export const StatsRoute = router;
