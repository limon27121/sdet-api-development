import express from "express";
import { sign_up } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", sign_up);

export default router;
