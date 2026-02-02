import { Resend } from "resend";
import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, program = "Not specified", message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Message are required",
      });
    }

    let emailSent = false;
    let result = null;

    // Try Gmail first (more reliable for sending to any email)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: 'learnwithlogix@gmail.com', // ✅ Always send to this email
          replyTo: email,
          subject: '📩 New Contact Form Submission - LearnLogix',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
                New Contact Message from LearnLogix
              </h2>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong style="color: #333;">Name:</strong> ${name}</p>
                <p><strong style="color: #333;">Email:</strong> ${email}</p>
                <p><strong style="color: #333;">Interested Program:</strong> ${program}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Message:</h3>
                <p style="line-height: 1.6; color: #555;">${message}</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #888; font-size: 12px; text-align: center;">
                This message was sent from the LearnLogix contact form.<br>
                Reply directly to this email to respond to ${name}.
              </p>
            </div>
          `
        };

        result = await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log("✅ Email sent via Gmail to learnwithlogix@gmail.com:", result.messageId);
      } catch (gmailError) {
        console.error("❌ Gmail failed:", gmailError);
      }
    }

    // Fallback to Resend only if Gmail fails (but Resend has limitations)
    if (!emailSent && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        result = await resend.emails.send({
          from: "LearnLogix <onboarding@resend.dev>",
          to: ["atifafsar70@gmail.com"], // Resend limitation: can only send to verified email
          replyTo: email,
          subject: "📩 Contact Form - Forward to learnwithlogix@gmail.com",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⚠️ Note:</strong> Please forward this to learnwithlogix@gmail.com
                </p>
              </div>
              
              <h2 style="color: #333;">New Contact Message from LearnLogix</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Program:</strong> ${program}</p>
              <p><strong>Message:</strong> ${message}</p>
            </div>
          `,
        });

        if (!result.error) {
          emailSent = true;
          console.log("✅ Email sent via Resend (needs forwarding):", result);
        }
      } catch (resendError) {
        console.error("❌ Resend also failed:", resendError);
      }
    }

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "Message sent successfully",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Email service temporarily unavailable. Please try again later.",
      });
    }

  } catch (error) {
    console.error("❌ Mail error:", error);
    return res.status(500).json({
      success: false,
      message: "Email sending failed",
    });
  }
};
