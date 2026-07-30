import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', asyncHandler(async (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.MY_RECEIVER_EMAIL,
    subject: `New Message from ${req.name}: ${req.subject}`,
    text: `
      Name: ${req.name}
      Email: ${req.email}
      Phone: ${req.phone}

      Message: ${req.message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`New message from ${req.name} sent successfully`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}));

export default router;
