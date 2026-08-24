import express from "express";
import { get_users, get_user_by_id, upload_photo } from "../controller/users.controller.js";
import { verify_token } from "../middlewares/auth.middleware.js";
import { upload, handle_upload_error } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", get_users);
router.post(
    "/upload",
    verify_token,
    upload.single("photo"),
    handle_upload_error,
    upload_photo
);
router.get("/:id", get_user_by_id);

export default router;
