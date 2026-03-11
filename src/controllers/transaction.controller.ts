import mongoose from "mongoose";
import { AccountModel, IAccountDocument } from "../models/account.model";
import { TransactionModel, ITransaction } from "../models/transaction.model";
import { LedgerModel, ILedger } from "../models/ledger.model";
import { emailService } from "../services/email.service";

/**
 * - Create a new transaction
 *
 * The 10-step process for creating a new transaction is as follows:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4, Derive sender balance from ledger
 * 5. Create transaction with "Pending" status
 * 6. Create Debit ledger entry for sender
 * 7. Create Credit ledger entry for recipient
 * 8. Update transaction status to "Completed"
 * 9. Commit MongoDB session
 * 10. Send email notifications to both parties
 *
 */

async function createTransaction(req: any, res: any) {
  // Step 1: Validate request

  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const fromUserAccount = await AccountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await AccountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({ message: "One or both accounts not found" });
  }

  //  Step 2: Validate idempotency key

  const existingTransaction = await TransactionModel.findOne({
    idempotencyKey,
  });

  if (existingTransaction) {
    if (existingTransaction.status === "Completed") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: existingTransaction,
      });
    }

    if (existingTransaction.status === "Pending") {
      return res.status(200).json({
        message: "Transaction is still pending",
      });
    }

    if (existingTransaction.status === "Failed") {
      return res.status(500).json({
        message: "Previous transaction attempt failed, you can retry",
      });
    }
    if (existingTransaction.status === "Reversed") {
      return res.status(500).json({
        message: "Transaction was reversed, you can retry",
      });
    }
  }

  // 3. Check account status

  if (
    fromUserAccount.status !== "Active" ||
    toUserAccount.status !== "Active"
  ) {
    return res
      .status(400)
      .json({ message: "One or both accounts are not active" });
  }

  //   4. Derive sender balance from ledger

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance: ${balance}. Requested amount: ${amount}`,
    });
  }

  //   5. Create transaction with "Pending" status

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = (
    await TransactionModel.create(
      {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "Pending",
      },

      { session },
    )
  )[0];
  const debitLedgerEntry = await LedgerModel.create(
    {
      account: fromAccount,
      amount: -amount,
      transaction: transaction._id,
      type: "Debit",
    },
    { session },
  );

  const creditLedgerEntry = await LedgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "Credit",
    },
    { session },
  );

  transaction.status = "Completed";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  // 10. Send email notifications
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    transaction._id.toString(),
    toUserAccount._id.toString(),
  );

  res.status(201).json({
    message: "Transaction completed successfully",
    transaction,
  });
}

async function createInitialFunds(req: any, res: any) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const toUserAccount = await AccountModel.findOne({
    _id: toAccount,
  });
  if (!toUserAccount) {
    return res.status(404).json({ message: "Recipient account not found" });
  }

  const fromUserAccount = await AccountModel.findOne({
    user: req.user._id,
  });
  if (!fromUserAccount) {
    return res.status(404).json({ message: "System account not found" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await new TransactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "Pending",
  });

  const debitLedgerEntry = await LedgerModel.create(
    [{
      account: fromUserAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "Debit",
    }],
    { session },
  );

  const creditLedgerEntry = await LedgerModel.create(
    [{
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "Credit",
    }],
    { session },
  );

  transaction.status = "Completed";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();


  res.status(201).json({
    message: "Initial funds added successfully",
    transaction,
  });
}

export const transactionController = {
  createTransaction,
  createInitialFunds,
};
