import { Schema, model } from "mongoose";
import { IParcel, Parcel_Status, Payment_Status, Status, StatusLog } from "./parcel.interface";

const statusLogSchema = new Schema<StatusLog>(
  {
    status: { type: String, enum: Object.values(Parcel_Status), required: true },
    updatedBy: { type: String, required: true },
    location: { type: String, required: true },
    note: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false, _id: false }
);

const parcelSchema = new Schema<IParcel>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverEmail: { type: String},
    receiverNumber: { type: String, required: true },
    title: { type: String, required: [true, "Please provide parcel title"] },
    type: { type: String, required: [true, "Please specify parcel type"] },
    weight: { type: Number, required: [true, "Please specify parcel weight"] },
    trackingId: { type: String, required: true, unique: true },
    division: { type: String, required: [true, "Please provide division"] },
    city: { type: String, required: [true, "Please provide city"] },
    upazila: {type: String, required: [true, "Please provide upazila"]},
    area: { type: String, required: [true, "Please provide area"] },
    status: { type: String, enum: Object.values(Status), default: Status.requested },
    payment: { type: String, enum: Object.values(Payment_Status), default: Payment_Status.PENDING },
    statusLog: { type: [statusLogSchema], default: [] },
    feedBack: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Parcel = model<IParcel>("Parcel", parcelSchema);
