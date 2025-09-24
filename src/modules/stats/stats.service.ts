import { PAYMENT_STATUS } from "../../payment/payment.interface";
import { Payment } from "../../payment/payment.model";
import { Parcel } from "../parcel/parcel.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";

const now = new Date();
const oneWeekAge = new Date(now).setDate(now.getDate() - 7);
const oneMonthAge = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const totalUsersPromise = User.countDocuments();

  const totalActiveUsersPromise = User.countDocuments({ isActive: IsActive.active });
  const totalInActiveUsersPromise = User.countDocuments({ isActive: IsActive.inActive });
  const totalBlockedUsersPromise = User.countDocuments({ isActive: IsActive.blocked });

  const newUsersInLastWeekPromise = User.countDocuments({
    createdAt: { $gte: oneWeekAge },
  });

  const newUsersInLastMonthPromise = User.countDocuments({
    createdAt: { $gte: oneMonthAge },
  });

  const usersByRolePromise = User.aggregate([
    // stage -1 : Grouping users by role and count total users in each role
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUsersInLastWeek, newUsersInLastMonth, usersByRole] =
    await Promise.all([
      totalUsersPromise,
      totalActiveUsersPromise,
      totalInActiveUsersPromise,
      totalBlockedUsersPromise,
      newUsersInLastWeekPromise,
      newUsersInLastMonthPromise,
      usersByRolePromise,
    ]);

  return {
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLastWeek,
    newUsersInLastMonth,
    usersByRole,
  };

  // ----
};

const parcelStats = async () => {
  const totalParcelPromise = Parcel.countDocuments();

  const totalParcelByStatusPromise = Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

  const statusLogEachStatusCountPromise = await Parcel.aggregate([
    {
      $project: {
        lastStatus: {
          $ifNull: [
            { $arrayElemAt: ["$statusLog.status", -1] },
            "N/A", // fallback if null
          ],
        },
      },
    },
    {
      $group: {
        _id: "$lastStatus",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  const [totalParcel, totalParcelByStatus, statusLogEachStatusCount] = await Promise.all([
    totalParcelPromise,
    totalParcelByStatusPromise,
    statusLogEachStatusCountPromise,
  ]);

  // console.log(totalParcel, totalParcelByStatus, statusLogEachStatusCount)

  return { totalParcel, totalParcelByStatus, statusLogEachStatusCount };
};

const getPaymentStats = async () => {
  const totalPaymentPromise = Payment.countDocuments();

  const totalPaymentByStatusPromise = Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

  const totalRevenuePromise = Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  const avgTotalAmountPromise = Payment.aggregate([{ $group: { _id: "null", avgPaymentAmount: { $avg: "$amount" } } }]);

  const [totalPayment, totalPaymentByStatus, totalRevenue, avgTotalAmount] = await Promise.all([
    totalPaymentPromise,
    totalPaymentByStatusPromise,
    totalRevenuePromise,
    avgTotalAmountPromise,
  ]);

  return { totalPayment, totalPaymentByStatus, totalRevenue, avgTotalAmount };

  // -----
};

export const StatsService = { getUserStats, getPaymentStats, parcelStats };
