import express from "express";
import helloRoute from "./routes/hello.route.js";
import usersRoute from "./routes/users.route.js";

const app = express();

app.use(express.json()); // parse JSON request body

app.use("/hello", helloRoute);
app.use("/users", usersRoute);

export default app;
