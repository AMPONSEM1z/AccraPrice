// supabase/functions/send-order-paid-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import nodemailer from "npm:nodemailer";

serve(async (req) => {
  try {
    const { email, orderNumber, totalAmount } = await req.json();

    if (!email) {
      return new Response("Missing email address", { status: 400 });
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPass = Deno.env.get("GMAIL_PASS");

    if (!gmailUser || !gmailPass) {
      return new Response("Missing Gmail credentials", { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const mailOptions = {
      from: `"GlobalNest Import" <${gmailUser}>`,
      to: email,
      subject: `Your order #${orderNumber} has been marked as PAID`,
      text: `
Hello,

Thank you for your purchase! Your order #${orderNumber} has been marked as PAID.

Total amount: $${totalAmount.toFixed(2)}

We’ll start processing your order shortly.

Kind regards,
GlobalNest Import Team
`,
    };

    await transporter.sendMail(mailOptions);

    return new Response("Email sent successfully", { status: 200 });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
