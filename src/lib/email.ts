import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (payload: {
  to: string;
  subject: string;
  text: string;
}) => {
  try {
    // Assuming OTP is in the text, e.g., "Your OTP is: 123456"
    const otpMatch = payload.text.match(/Your OTP is: (\d+)/);
    if (otpMatch) {
      console.log("OTP:", otpMatch[1]);
    }

    const response = await resend.emails.send({
      from: "noreply@resend.dev",
      ...payload,
    });

    console.log("Email sent successfully:", response);

    if (response?.data) return true;
    return false;
  } catch (error: any) {
    console.error("Error sending email:", error);
    return false;
  }
};
