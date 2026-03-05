import mongoose from "mongoose";

interface ITransaction {
  fromAccount: mongoose.Types.ObjectId;
  toAccount: mongoose.Types.ObjectId;
  amount: number;
  status: "Pending" | "Completed" | "Failed" | "Reversed";
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "Transaction must have a fromAccount"],
    index: true,
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "Transaction must have a toAccount"],
    index: true,
  },
  status:{
    type: String,
    enum: {
      values: ["Pending", "Completed", "Failed", "Reversed"],
      message: "Status must be either 'Pending', 'Completed', 'Failed', or 'Reversed'",
    },
    default: "Pending",
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount must be a positive number"],
  },
  idempotencyKey: {
    type: String,
    required: [true, "Idempotency key is required"],
    unique: true,
    index: true,
  }
}, { timestamps: true });


const TransactionModel = mongoose.model<ITransaction>("Transaction", transactionSchema);

export { TransactionModel, ITransaction };