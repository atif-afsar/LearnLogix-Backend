import express from "express";
import cors from "cors";
import contactRoutes from "./routes/contact.routes.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/contact", contactRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "Server is alive!" });
});

export default app;
