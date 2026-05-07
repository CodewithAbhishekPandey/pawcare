const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const getHeader = () => `
  <div style="background-color: #1A3A2A; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-family: sans-serif;">🐾 Pawvetra</h1>
  </div>
`;

const getFooter = () => `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; font-family: sans-serif;">
    Pawvetra &middot; Gurugram, India &middot; support@pawvetra.in
  </div>
`;

exports.sendOrderConfirmation = async (userEmail, userName, order) => {
  try {
    const itemsList = order.items.map(item => `<li>${item.qty}x ${item.productRef?.name || 'Product'}</li>`).join('');
    
    const mailOptions = {
      from: `"Pawvetra" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Order Confirmed — Pawvetra #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          ${getHeader()}
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p>Your order has been placed successfully! Here are your items:</p>
            <ul>${itemsList}</ul>
            <p style="font-size: 18px; font-weight: bold;">Total: ₹${order.total}</p>
            <p>We'll notify you when it's dispatched.</p>
          </div>
          ${getFooter()}
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email failed (sendOrderConfirmation):', err);
  }
};

exports.sendOrderProcessing = async (userEmail, userName, order, agent) => {
  try {
    const mailOptions = {
      from: `"Pawvetra" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `📦 Your order is being prepared — Pawvetra`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          ${getHeader()}
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p>Your order is now being packed.</p>
            <p>Your delivery agent <strong>${agent.name}</strong> (${agent.phone}) will deliver it by <strong>${new Date(order.estimatedDelivery).toLocaleString()}</strong>.</p>
            <p>Track your order in the app.</p>
          </div>
          ${getFooter()}
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email failed (sendOrderProcessing):', err);
  }
};

exports.sendOrderDelivered = async (userEmail, userName, order) => {
  try {
    const mailOptions = {
      from: `"Pawvetra" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🎉 Order Delivered — Pawvetra`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          ${getHeader()}
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p>Your order has been delivered! We hope your pet loves it.</p>
            <p>Please leave a review in the app.</p>
          </div>
          ${getFooter()}
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email failed (sendOrderDelivered):', err);
  }
};

exports.sendOrderCancelled = async (userEmail, userName, order, cancelledBy) => {
  try {
    const reasonText = cancelledBy === 'customer'
      ? 'Your order has been cancelled as requested.'
      : `We're sorry — your order was cancelled by our team. Reason: ${order.cancellationReason || 'No reason provided'}. Contact support@pawvetra.in for help.`;

    const mailOptions = {
      from: `"Pawvetra" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `❌ Order Cancelled — Pawvetra`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          ${getHeader()}
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p>${reasonText}</p>
          </div>
          ${getFooter()}
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email failed (sendOrderCancelled):', err);
  }
};
