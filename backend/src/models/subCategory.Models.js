import mongoose, { Schema } from "mongoose";

const subcategorySchema = new mongoose.Schema(
    {
        subcategoryName: {
            type: String,
            required: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
    },
    { timestamps: true }
);

export const Subcategory =  mongoose.model("Subcategory", subcategorySchema);
