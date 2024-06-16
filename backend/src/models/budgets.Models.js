import mongoose, { Schema } from "mongoose";

const budgetSchema = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        budgetName: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            default: 0,
            validate: {
                validator: function (v) {
                    return v >= 0;
                },
                message: (props) =>
                    `${props.value} is not a valid amount! Amount must be non-negative.`,
            },
        },
        startDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    return v > this.startDate;
                },
                message: "End date must be after the start date.",
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
