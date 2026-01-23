import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendEmail } from "./utils/sendEmail.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/env-check", (req, res) => {
  res.json({
    EMAIL_USER: process.env.EMAIL_USER || null,
    EMAIL_PASS: process.env.EMAIL_PASS ? "SET" : null,
  });
});


// CONTACT FORM ROUTE
app.post("/api/contact", async (req, res) => {
  const { name, email, program, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, Email and Message are required",
    });
  }

  try {
    await sendEmail({ name, email, program, message });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
  console.error("FULL EMAIL ERROR:", error);
  res.status(500).json({
    success: false,
    message: error.message,
  });
}

});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
