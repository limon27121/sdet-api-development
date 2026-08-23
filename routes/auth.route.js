import express from "express";
import { sign_up, log_in } from "../controller/auth.controller.js";
import { verify_token, is_admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// only a logged-in admin may create users
router.post("/signup", verify_token, is_admin, sign_up);
router.post("/login", log_in);

export default router;
