import mongoose, { Schema } from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        walletId: {
            type: Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
            index: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["expense", "income", "transfer", "savings"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            validate: {
                validator: function (v) {
                    return v >= 0;
                },
                message: (props) =>
                    `${props.value} is not a valid amount! Amount must be non-negative.`,
            },
        },
        description: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        budgetId: {
            type: Schema.Types.ObjectId,
            ref: "Budget",
            required: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
