import nodemailer from "nodemailer";

// Create transporter ONCE (important for performance)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ name, email, program, message }) => {
  if (!name || !email || !message) {
    throw new Error("Missing required fields");
  }

  await transporter.sendMail({
    from: `"LearnLogix Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: "📩 New Contact Form Submission",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>New Contact Message</h2>
        <hr />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Program:</strong> ${program || "Not specified"}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f9f9f9;padding:12px;border-radius:8px;border-radius:8px">
          ${message}
        </p>
      </div>
    `,
  });
};
