import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// IMPORT ROUTERS
import userRouter from "./routes/users.Routes.js";
import walletRouter from "./routes/wallets.Routes.js"


// USE ROUTER FUNCTION
app.use("/api/v1/users", userRouter);
app.use("/api/v1/wallets", walletRouter);

export { app };
