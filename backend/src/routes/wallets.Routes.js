import { Router } from "express";
import { createWallet } from "../controllers/wallets.Controllers.js";


import { upload } from "../middlewares/multer.Middleware.js";
import { verifyJWT } from "../middlewares/auth.Middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-wallet").post(
    upload.fields([
        {
            name: "walletIcon",
            maxCount: 1,
        },
    ]),
    createWallet
);
export default router;