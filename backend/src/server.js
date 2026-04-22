import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on 0.0.0.0:3000");
})


