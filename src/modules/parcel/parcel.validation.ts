import { z } from "zod";
import { Payment_Status, Status } from "./parcel.interface";

export const createParcelSchema = z.object({
  senderId: z.string().min(1, "Sender ID is required"),
  title: z.string().min(1, "Parcel title is required"),
  type: z.string().min(1, "Parcel type is required"),
  weight: z.number().min(1, "Weight must be positive").default(1),
  trackingId: z.string().optional(),
  division: z.string().min(1, "Division is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  status: z.enum([Status.requested]).optional(),
  payment: z.enum([Payment_Status.PENDING]).optional(),
  statusLog: z.array(z.string()).optional(),
  receiverNumber: z.string(),
  receiverEmail: z.email().optional(),
});
