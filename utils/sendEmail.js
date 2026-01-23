import nodemailer from "nodemailer";

export const sendEmail = async ({ name, email, program, message }) => {
  if (!name || !email || !message) {
    throw new Error("Missing required fields");
  }

  // Create transporter INSIDE function (safer for serverless)
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
      <div style="font-family: Arial, sans-serif; line-height: 1.6"> 
        <h2>New Contact Message</h2>
        <hr />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ] 
        <p><strong>Program:</strong> ${program || "Not specified"}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f9f9f9;padding:12px;border-radius:8px">
          ${message}
        </p>
      </div>
    `,
  });
};
