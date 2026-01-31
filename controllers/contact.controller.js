import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, program = "Not specified", message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Message are required",
      });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set");
      return res.status(500).json({
        success: false,
        message: "Email service not configured",
      });
    }

    const result = await resend.emails.send({
      from: "LearnLogix <onboarding@resend.dev>",
      to: ["learnwithlogix@gmail.com"], // ✅ ALL emails go here
      replyTo: email,
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Program:</strong> ${program}</p>
        <p>${message}</p>
      `,
    });

    console.log("Email send result:", result);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ Mail error:", error);
    return res.status(500).json({
      success: false,
      message: "Email sending failed",
    });
  }
};
