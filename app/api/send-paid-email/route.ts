import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, orderNumber, totalAmount } = await req.json();

    if (!email || !orderNumber || !totalAmount) {
      return NextResponse.json(
        { error: "Missing email, orderNumber, or totalAmount" },
        { status: 400 }
      );
    }

    // Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Order Paid - AccraPrice</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f4f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" 
                 style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:40px; text-align:center;">
                <img 
                  src="https://tsnkaxxoyycsahbhqtez.supabase.co/storage/v1/object/public/logo/globalnestimportslogo.jpeg"
                  alt="GlobalNestImports Logo" 
                  width="90" 
                  style="margin-bottom:20px; border-radius:10px;"
                />

                <h1 style="color:#111827; font-size:24px; margin-bottom:10px;">
                  Your order has been paid!
                </h1>

                <p style="color:#4b5563; font-size:15px; line-height:1.6; margin-bottom:30px;">
                  Thank you for your payment of <strong>$${totalAmount.toFixed(
                    2
                  )}</strong>.<br/>
                  Your order <strong>#${orderNumber}</strong> is now marked as <strong>PAID</strong>.
                </p>

                <a href="https://accraprice.netlify.app/auth/login" 
                   style="background-color:#16a34a; color:white; padding:12px 28px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block;">
                  View Your Order
                </a>

                <p style="margin-top:30px; color:#6b7280; font-size:13px; line-height:1.5;">
                  If you did not make this purchase, please contact support immediately.<br>
                  This is an automated notification.
                </p>
              </td>
            </tr>
            <tr>
              <td style="text-align:center; padding:20px; color:#9ca3af; font-size:12px;">
                &copy; ${new Date().getFullYear()} AccraPrice. All rights reserved.
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"AccraPrice" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your order #${orderNumber} has been paid`,
      text: `Thank you for your payment of $${totalAmount.toFixed(
        2
      )}. Your order #${orderNumber} is now PAID.`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
