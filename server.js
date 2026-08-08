import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/dbConn.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🌟 OwlSync running on port ${PORT}`),
  );
});
