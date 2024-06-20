import mongoose, { Schema } from "mongoose";

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        walletName: {
            type: String,
            required: true,
        },
        walletIcon: {
            type: String,
        },
        initialAmount: {
            type: Number,
            default: 0,
            validate: {
                validator: function (v) {
                    return v >= 0;
                },
                message: (props) =>
                    `${props.value} is not a valid initial amount! Initial amount must be non-negative.`,
            },
        },
        balanceAmount: {
            type: Number,
            default: 0,
            validate: {
                validator: function (v) {
                    return v >= 0;
                },
                message: (props) =>
                    `${props.value} is not a valid balance amount! Balance amount must be non-negative.`,
            },
        },
    },
    { timestamps: true }
);
export const Wallet =  mongoose.model("Wallet", walletSchema);
