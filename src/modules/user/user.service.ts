import CustomError from "../../errorHelper/CustomError";
import { User } from "./user.model";
import status from "http-status-codes";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";
import { IAuthProvider, IUser, Role, UpdateUser } from "./user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, role, ...rest } = payload;

  if (role === Role.admin) throw new CustomError(status.LOCKED, "Not authorized");

  const isUserExist = await User.findOne({ email });

  if (isUserExist) throw new CustomError(status.BAD_REQUEST, `Already ${email} exist`);

  const hashedPass = await bcrypt.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

  const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };

  const user = await User.create({ email, password: hashedPass, role, auths: [authProvider], ...rest });

  return user;
};

const getMe = async (email: string) => {
  const user = await User.findOne({ email }).select("-password").select("-isDeleted");
  return user;
};

const updateProfile = async (email: string, payload: UpdateUser) => {
  const user = await User.findOne({ email });

  if (!user) throw new CustomError(status.NOT_FOUND, "User not found");

  const updateUser = await User.findByIdAndUpdate(user._id, { $set: { phone: payload.phone, address: payload.address } });

  return updateUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const users = await queryBuilder.search(["email", "phone", "role"]).filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([users.build(), queryBuilder.getMeta()]);
  return { data, meta };

  // return { data: users, meta: { total: totalUsers } };
};

const updateUserRole = async (email: string, role: Role) => {
  const user = await User.findOne({ email });
  if (!user) throw new CustomError(401, "User not found");

  const updateRole = await User.findByIdAndUpdate(user._id, { role });

  return updateRole;
};

export const UserService = { createUser, getMe, updateProfile, getAllUsers, updateUserRole };
