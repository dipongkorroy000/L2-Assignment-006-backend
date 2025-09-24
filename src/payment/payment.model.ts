import { model, Schema } from "mongoose";
import { IPayment, PAYMENT_STATUS } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    parcel: { type: Schema.Types.ObjectId, ref: "Parcel", required: true, unique: true },
    transactionId: { type: String, required: true, unique: true },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.UNPAID },
    amount: { type: Number, required: true },
    paymentGatewayData: { type: Object },
    invoiceUrl: { type: String },
    createdAt: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
