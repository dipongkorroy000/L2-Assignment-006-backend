import { Router } from "express";
import { UserRoute } from "../modules/user/user.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { ParcelRoute } from "../modules/parcel/parcel.route";
import { PaymentRoutes } from "../payment/payment.route";
import { StatsRoute } from "../modules/stats/stats.route";
import { ParcelVerificationRoutes } from "../otp/otp.parcel-route";
import { VerificationRoutes } from "../verification/otp.route";

export const routes = Router();

const moduleRoutes = [
  { path: "/user", route: UserRoute },
  { path: "/auth", route: AuthRoute },
  { path: "/parcel", route: ParcelRoute },
  { path: "/payment", route: PaymentRoutes },
  { path: "/stats", route: StatsRoute },
  { path: "/otp", route: ParcelVerificationRoutes },
  { path: "/verification", route: VerificationRoutes },
];

moduleRoutes.forEach((route) => {
  routes.use(route.path, route.route);
});
