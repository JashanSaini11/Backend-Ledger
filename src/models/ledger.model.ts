import mongoose from "mongoose";

interface ILedger {
  account: mongoose.Types.ObjectId;
  amount: number;
  transaction: mongoose.Types.ObjectId;
  type: "Debit" | "Credit";
  createdAt: Date;
  updatedAt: Date;
}

const ledgerSchema = new mongoose.Schema<ILedger>({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Ledger entry must be associated with an account"],
        index: true,
        immutable: true,
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        immutable: true,
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Ledger entry must be associated with a transaction"],
        index: true,
        immutable: true,
    },
    type: {
        type: String,
        enum: {
            values: ["Debit", "Credit"],
            message: "Type must be either 'Debit' or 'Credit'",
        },
        required: [true, "Type is required"],
        immutable: true,
    }
}, { timestamps: true })


function preventLedgerModification(this: mongoose.Document, next: (err?: any) => void) {
    if (!this.isNew) {
        return next(new Error("Ledger entries cannot be modified after creation"));
    }
    next();
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const LedgerModel = mongoose.model<ILedger>("Ledger", ledgerSchema);

export { LedgerModel, ILedger };