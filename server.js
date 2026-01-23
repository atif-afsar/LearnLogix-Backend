import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();

/* ==========================
   MIDDLEWARE
========================== */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ==========================
   CONTACT FORM ROUTE
   (MATCHES FRONTEND FIELDS)
========================== */
app.post("/api/contact", async (req, res) => {
  try {
    const {
      name,
      email,
      program = "Not specified",
      message,
    } = req.body;

    // ✅ Required fields (same as frontend)
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Message are required",
      });
    }

    // ✅ ENV safety check
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Missing EMAIL env vars");
      return res.status(500).json({
        success: false,
        message: "Email service not configured",
      });
    }

    // 🔹 Create transporter INSIDE request (serverless safe)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"LearnLogix Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Message</h2>
        <hr />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Program:</strong> ${program}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ Mailer error:", error);

    return res.status(500).json({
      success: false,
      message: "Email sending failed",
    });
  }
});

/* ==========================
   TEST ROUTE
========================== */
app.get("/test", (req, res) => {
  res.json({ message: "Server is alive!" });
});

/* ==========================
   EXPORT (NO app.listen)
========================== */
export default app;
