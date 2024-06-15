import mongoose from "mongoose";

const DB_NAME = "expenseTracker";
const DB_URL = `mongodb://127.0.0.1:27017/${DB_NAME}`;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log("MongoDB Connection successful!");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

export default connectDB;
