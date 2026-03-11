import mongoose from "mongoose";
import { LedgerModel } from "./ledger.model";

interface IAccount {
  user: mongoose.Types.ObjectId;
  status: "Active" | "Inactive" | "Frozen";
  currency: string;
  getBalance(): Promise<number>;
}

interface IAccountDocument extends mongoose.Document, IAccount {
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new mongoose.Schema<IAccountDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Account must be associated with a user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive", "Frozen"],
        message: "Status must be either 'Active', 'Inactive', or 'Frozen'",
      },
      default: "Active",
    },

    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "INR",
    },
  },
  { timestamps: true },
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const accountId = new mongoose.Types.ObjectId(this._id);
  
  const balanceData = await LedgerModel.aggregate([
    { $match: { account: accountId } },
    {
      $group: {
        _id: null,
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0],
          },
        },
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  if (balanceData.length === 0) {
    return 0;
  }

  return balanceData[0].balance;
};

const AccountModel = mongoose.model<IAccountDocument>("Account", accountSchema);

export { AccountModel, IAccountDocument };
