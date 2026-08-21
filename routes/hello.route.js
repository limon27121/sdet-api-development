import express from "express";
import { get_hello } from "../controller/hello.controller.js";

const router = express.Router();

router.get("/", get_hello);

export default router;
