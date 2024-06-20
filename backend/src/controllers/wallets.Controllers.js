import { isValidObjectId } from "mongoose";
import { Wallet } from "../models/wallets.Models.js";

import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteCloudinary.js";

// CREATE A WALLET

const createWallet = asyncHandler(async (req, res) => {
    const { walletName, initialAmount } = req.body;
    if ([walletName, initialAmount].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }
    const walletIconLocalPath = req.files?.walletIcon[0]?.path;
    if (!walletIconLocalPath) {
        throw new apiError(400, "walletIcon file is required");
    }

    const walletIconURL = await uploadOnCloudinary(walletIconLocalPath);
    const newWallet = await Wallet.create({
        userId: req.user._id,
        content: walletIconURL.url,
        walletName,
        initialAmount,
        balanceAmount: initialAmount,
    });
    if (!newWallet) {
        throw new apiError(
            500,
            "Something went wrong while creating the wallet"
        );
    }
    console.log(`WALLET  CREATED`);

    return res
        .status(201)
        .json(new apiResponse(200, newWallet, "Wallet Created Successfully"));
});

// DELETE A WALLET

const deleteWallet = asyncHandler(async (req, res) => {
    const { walletId } = req.params;

    try {
        const wallet = await Wallet.findById(walletId);

        if (!wallet) {
            return res
                .status(404)
                .json(apiError("No wallet found with this ID"));
        }

        deleteImageFromCloudinary(wallet.walletIcon);
        const deletedWallet = await Wallet.findByIdAndDelete(walletId);

        console.log("Details of a deleted wallet:");
        console.log(deletedWallet);

        if (!deletedWallet) {
            return res
                .status(404)
                .json(apiError("No wallet found with this ID"));
        }

        return res
            .status(200)
            .json(
                apiResponse(200, deletedWallet, "Wallet deleted successfully")
            );
    } catch (error) {
        console.error(error);
        return res.status(500).json(apiError("Server error"));
    }
});

// GET WALLET DETAILS BY ID

const walletDetails = asyncHandler(async (req, res) => {
    const { walletId } = req.params;
    try {
        const wallet = await Wallet.findOne({ _id: walletId });

        if (!wallet) {
            return res
                .status(404)
                .json(apiError("No wallet found with this ID"));
        }

        return res
            .status(200)
            .json(
                apiResponse(
                    200,
                    wallet,
                    "Wallet details retrieved successfully"
                )
            );
    } catch (error) {
        console.error(error);
        return res.status(500).json(apiError("Server error"));
    }
});

export { createWallet, deleteWallet,walletDetails };
