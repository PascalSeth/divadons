import nodemailer from 'nodemailer';

// Nodemailer transporter setup using environment variables
// Make sure to add these to your .env file
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

const DEFAULT_FROM = process.env.EMAIL_FROM || '"Diva & Dons" <noreply@admin.com>';

export async function sendOrderConfirmationEmail(toEmail: string, orderId: string, total: number) {
  try {
    const transporter = getTransporter();
    
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(total);

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to: toEmail,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
          <h1 style="text-align: center; color: #000; font-family: serif;">Diva & Dons</h1>
          <hr style="border: 1px solid #f5f5f4;" />
          <h2>Order Confirmed!</h2>
          <p>Thank you for shopping with us. Your order <strong>${orderId}</strong> has been successfully placed.</p>
          <p><strong>Total Paid:</strong> ${formattedTotal}</p>
          <p>We'll notify you as soon as your luxury items have shipped.</p>
          <br/>
          <p style="font-size: 12px; color: #78716c;">© ${new Date().getFullYear()} Diva & Dons.</p>
        </div>
      `,
    });
    
    console.log('[EMAIL_SENT] Order Confirmation:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL_ERROR] Failed to send order confirmation:', error);
    return { success: false, error };
  }
}

export async function sendStatusUpdateEmail(toEmail: string, orderId: string, status: string, trackingInfo?: { trackingId?: string, carrierName?: string }) {
  try {
    const transporter = getTransporter();
    
    let trackingHtml = '';
    if (status === 'shipped' && trackingInfo?.trackingId) {
      trackingHtml = `
        <div style="background-color: #f5f5f4; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <p style="margin: 0;"><strong>Tracking ID:</strong> ${trackingInfo.trackingId}</p>
          <p style="margin: 4px 0 0 0;"><strong>Carrier:</strong> ${trackingInfo.carrierName || 'Standard Shipping'}</p>
        </div>
      `;
    }

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to: toEmail,
      subject: `Order Status Update - ${orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
          <h1 style="text-align: center; color: #000; font-family: serif;">Diva & Dons</h1>
          <hr style="border: 1px solid #f5f5f4;" />
          <h2>Order Update</h2>
          <p>Your order <strong>${orderId}</strong> has been updated to: <strong><span style="text-transform: capitalize;">${status}</span></strong>.</p>
          ${trackingHtml}
          <br/>
          <p style="font-size: 12px; color: #78716c;">© ${new Date().getFullYear()} Diva & Dons.</p>
        </div>
      `,
    });
    
    console.log('[EMAIL_SENT] Status Update:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL_ERROR] Failed to send status update:', error);
    return { success: false, error };
  }
}
