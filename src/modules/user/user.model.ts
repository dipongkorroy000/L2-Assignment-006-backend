import { model, Schema } from "mongoose";
import { IUser, Role, IsActive, IAuthProvider } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { versionKey: false, _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: Object.values(Role), default: Role.sender },
    phone: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: String, enum: Object.values(IsActive), default: IsActive.active },
    auths: [authProviderSchema],
    isVerified: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);

export const User = model<IUser>("User", userSchema);
