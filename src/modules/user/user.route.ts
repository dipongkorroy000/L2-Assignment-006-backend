import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { authorize } from "../../middlewares/authorize";
import { Role } from "./user.interface";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser);

// anyone use
router.get("/profile", authorize(...Object.values(Role)), UserControllers.getMe);

// update by query(email) user profile
router.patch("/", authorize(Role.sender, Role.receiver), UserControllers.updateProfile);

// admin routes
router.get("/all-users", authorize(Role.admin, Role.super_admin), UserControllers.getAllUsers);

// update user role by {email, role} = req.body;
// super admin can make super admin & admin & sender & receiver
// and admin can make admin & sender & receiver
router.patch("/updateUserRole", authorize(Role.admin, Role.super_admin), UserControllers.updateUserRole);

export const UserRoute = router;
