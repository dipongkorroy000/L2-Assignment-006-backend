import { Router } from "express";
import { authorize } from "../../middlewares/authorize";
import { Role } from "../user/user.interface";
import { parcelController } from "./parcel.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createParcelSchema } from "./parcel.validation";

const route = Router();

// parcel delivery request(create) by receiver or admin
route.post("/create-parcel", validateRequest(createParcelSchema), authorize(Role.admin, Role.sender), parcelController.parcelRequest);

// all parcels get by admin
route.get("/all-parcel", authorize(Role.admin, Role.super_admin), parcelController.allParcels);

// receiver picked(confirm parcel) parcel by email or phoneNumber
route.patch("/confirm", parcelController.confirmParcel);

// all incoming parcels get by receiver
route.get("/receiver", authorize(Role.receiver), parcelController.receiverIncomingParcel);

// all delivery request parcels get by admin or sender
route.get("/myParcels/:senderId", authorize(Role.admin, Role.sender), parcelController.senderParcels);

// single incoming parcel get anyone with trackingId -> see parcel statusLog & title
route.get("/anyOne/:trackingId", parcelController.singleParcel);

// single parcel delete by admin
route.delete("/:trackingId", authorize(Role.admin, Role.super_admin), parcelController.deleteParcel);

// parcel statusLog(approved, dispatched, in-transit, delivered) update by admin
route.patch("/:parcelId", authorize(Role.admin, Role.super_admin), parcelController.parcelStatusUpdate);

// ---- parcel cancel by sender -> otp functionality 

export const ParcelRoute = route; 
