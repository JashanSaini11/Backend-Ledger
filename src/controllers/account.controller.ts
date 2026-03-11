import { AccountModel } from "../models/account.model";


async function createAccountController(req: any, res: any) {
    const user = req.user;

    const account = await AccountModel.create({
        user: user._id,
    })
    res.status(201).json({account})
}

async function getAccountsController(req: any, res: any) {
    const user = req.user;

    const accounts = await AccountModel.find({user: user._id})
    res.status(200).json({accounts})
}

async function getAccountBalanceController(req: any, res: any) {
    const {accountId} = req.params;

    const account = await AccountModel.findById({_id: accountId, user: req.user._id})

    if (!account) {
        return res.status(404).json({message: "Account not found"})
    }

    const balance = await account.getBalance();

    res.status(200).json({accountId,balance})
}


export const accountController = {
    createAccountController,
    getAccountsController,
    getAccountBalanceController
}