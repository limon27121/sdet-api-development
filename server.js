import "dotenv/config"; // must load before app.js, so env vars exist there
import app from "./app.js";
import sequelize, { connectDB } from "./config/db.js";
import "./models/user.model.js"; // register models before sync

const PORT = process.env.PORT || 5001;

await connectDB();

// keeps the users table in step with the model (adds the photo column).
// set DB_SYNC=false in .env once the schema is settled.
if (process.env.DB_SYNC !== "false") {
  await sequelize.sync({ alter: true });
  console.log("Database synced");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
