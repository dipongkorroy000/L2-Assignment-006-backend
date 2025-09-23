import { Types } from "mongoose";

export enum Status {
  requested = "REQUESTED",
  picked = "PICKED",
  cancel = "CANCEL",
}

export enum Parcel_Status {
  approved = "APPROVED",
  dispatched = "DISPATCHED",
  in_transit = "IN-TRANSIT",
  delivered = "DELIVERED",
}

export interface TParcelStatusLog {
  status: Parcel_Status;
  location: string;
  note: string;
}

export enum Payment_Status {
  PENDING = "PENDING",
  CANCEL = "CANCEL",
  COMPLETE = "COMPLETE",
  FAILED = "FAILED",
}

export interface Receiver {
  name: string;
  phone: string;
  address: string;
  timestamp: Date;
}

export interface StatusLog {
  status: Parcel_Status;
  updatedBy: string;
  location: string;
  note: string;
  timestamp: Date;
}

export interface IParcel {
  senderId: Types.ObjectId;
  title: string;
  type: string;
  weight: number;
  trackingId: string;
  division: string;
  city: string;
  area: string;
  receiverEmail?: string;
  receiverNumber: string;
  status: Status;
  payment: Payment_Status;
  statusLog?: StatusLog[];
  feedBack?: string;
}
