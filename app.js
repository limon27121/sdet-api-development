import express from "express";
import helloRoute from "./routes/hello.route.js";
import usersRoute from "./routes/users.route.js";
import authRoute from "./routes/auth.route.js";

const app = express();

app.use(express.json()); // parse JSON request body

app.use("/hello", helloRoute);
app.use("/users", usersRoute);
app.use("/auth", authRoute);

export default app;
