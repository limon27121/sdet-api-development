import express from "express";
import { get_users, get_user_by_id } from "../controller/users.controller.js";

const router = express.Router();

router.get("/", get_users);
router.get("/:id", get_user_by_id);

export default router;
