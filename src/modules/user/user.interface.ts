import { Types } from "mongoose";

export enum Role {
  admin = "ADMIN",
  sender = "SENDER",
  receiver = "RECEIVER",
  super_admin = "SUPER_ADMIN",
}

export interface IAuthProvider {
  provider: "credentials";
  providerId: string;
}

export enum IsActive {
  active = "ACTIVE",
  inActive = "INACTIVE",
  blocked = "BLOCKED",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  isDeleted?: string;
  isActive?: string;
  role: Role;
  auths: IAuthProvider[];
  bookings?: Types.ObjectId[];
  guides?: Types.ObjectId[];
  isVerified: boolean;
}

export interface UpdateUser {
  phone?: string;
  address?: string;
}
