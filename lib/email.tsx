import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface OrderStatusUpdateEmailParams {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: string;
}

export async function sendOrderStatusUpdateEmail(
  params: OrderStatusUpdateEmailParams
) {}

interface OrderReceiptParams {
  customerEmail: string;
  customerName: string;
  productName: string;
  amount: number;
  paystackReference: string;
  orderType: "available" | "preorder";
  orderDate: string;
  orderId: string;
}

export async function sendOrderReceipt(
  params: OrderReceiptParams
): Promise<{ success: boolean }> {
  const {
    customerEmail,
    customerName,
    productName,
    amount,
    paystackReference,
    orderType,
    orderDate,
    orderId,
  } = params;

  const orderTypeMessage =
    orderType === "preorder"
      ? "This is a pre-order. Your item will be shipped once it becomes available."
      : "Your order will be processed and shipped soon.";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
           Header 
          <div style="background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Payment Received!</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Thank you for your payment</p>
          </div>

           Content 
          <div style="padding: 40px 20px;">
            <p style="font-size: 16px; margin: 0 0 20px 0;">Hi ${customerName},</p>
            <p style="font-size: 16px; margin: 0 0 20px 0;">
              We've successfully received your payment. ${orderTypeMessage}
            </p>

             Payment Details 
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #0e7490;">Payment Receipt</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Order Number:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Payment Date:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Payment Reference:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${paystackReference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Product(s):</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${productName}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 700; color: #0e7490;">Amount Paid:</td>
                  <td style="padding: 12px 0 0 0; font-size: 20px; font-weight: 700; color: #0e7490; text-align: right;">GHS ${amount.toFixed(
                    2
                  )}</td>
                </tr>
              </table>
            </div>

            ${
              orderType === "preorder"
                ? `
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>Pre-Order Notice:</strong> This item is currently on pre-order. We'll notify you when it's ready to ship.
              </p>
            </div>
            `
                : ""
            }

            <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #065f46;">
                <strong>Payment Confirmed:</strong> Your payment has been successfully processed via Paystack.
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0;">
              If you have any questions about your order or payment, please contact our customer support.
            </p>
          </div>

           Footer 
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              © ${new Date().getFullYear()} AccraPrice. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"AccraPrice" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Payment Receipt - Order ${orderId}`,
      html: htmlContent,
    });
    console.log(` Payment receipt sent to ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error(" Error sending payment receipt:", error);
    return { success: false };
  }
}
