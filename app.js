import express from "express";
import { UPLOAD_DIR } from "./middlewares/upload.middleware.js";
import helloRoute from "./routes/hello.route.js";
import usersRoute from "./routes/users.route.js";
import authRoute from "./routes/auth.route.js";

const app = express();

app.use(express.json()); // parse JSON request body
app.use("/uploads", express.static(UPLOAD_DIR)); // serve uploaded photos

app.use("/hello", helloRoute);
app.use("/users", usersRoute);
app.use("/auth", authRoute);

export default app;
