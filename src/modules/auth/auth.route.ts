import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/login", AuthController.credentialLogin);

router.post("/logout", AuthController.logout);

router.post("/refresh-token", AuthController.getNewAccessToken)

export const AuthRoute = router;
