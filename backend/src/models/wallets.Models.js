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
        currentAmount: {
            type: Number,
            default: 0,
            validate: {
                validator: function (v) {
                    return v >= 0;
                },
                message: (props) =>
                    `${props.value} is not a valid current amount! Current amount must be non-negative.`,
            },
        },
    },
    { timestamps: true }
);
export default mongoose.model("Wallet", walletSchema);
