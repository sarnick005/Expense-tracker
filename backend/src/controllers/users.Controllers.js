import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/users.Models.js";

import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

// GENERATE ACCESS AND REFRESH TOKEN

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

// REGISTER USER

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new apiError(409, "This email is already registered");
    }
    const profilePicturePath = req.files?.profilePicture[0]?.path;
    if (!profilePicLocalPath) {
        throw new apiError(400, "Profile Picture file is required");
    }
    const profilePicture = await uploadOnCloudinary(profilePicLocalPath);
    if (!profilePicture) {
        throw new apiError(400, "Failed to upload Profile Picture file");
    }
    const newUser = await User.create({
        username,
        email,
        password,
        profilePicture: profilePicture.url,
    });
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new apiError(
            500,
            "Something went wrong while registering the user"
        );
    }
    console.log(`USER ${createdUser.username} REGISTERED`);
    return res
        .status(201)
        .json(
            new apiResponse(200, createdUser, "User registered Successfully")
        );
});

// LOGIN USER



export { generateAccessAndRefreshTokens,registerUser };
