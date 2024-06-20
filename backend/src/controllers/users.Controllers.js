import jwt from "jsonwebtoken";
import { User } from "../models/users.Models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { getCookieOptions } from "../utils/getCookieOptions.js";

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
    const profilePicLocalPath = req.files?.profilePicture[0]?.path;
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

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!password || !email) {
        throw new apiError(400, "password or email is required");
    }
    const existedUser = await User.findOne({ email });

    if (!existedUser) {
        throw new apiError(404, "User does not exist");
    }
    const isPasswordValid = await existedUser.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        existedUser._id
    );
    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshToken"
    );
    const options = getCookieOptions();
    console.log(`USER ${loggedInUser.username} LOGGED IN`);
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully!"
            )
        );
});

// LOGOUT USER

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );

        const options = getCookieOptions();

        console.log("USER LOGGED OUT");

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new apiResponse(200, {}, "User logged out successfully!"));
    } catch (error) {
        console.error("Error logging out user:", error);
        throw new apiError(500, "Internal server error");
    }
});

// REFRESH ACCESS TOKEN

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new apiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new apiError(401, "Refresh token is expired or invalid");
        }

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        const options = getCookieOptions();

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new apiError(401, error.message || "Invalid refresh token");
    }
});

// GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiResponse(200, req.user, "User fetched successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
};
