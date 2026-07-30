import express from 'express';
import nodemailer from 'nodemailer';
import { asyncHandler } from '../middleware/errorHandler.js';

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
  const { name, email, phone, subject, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.MY_RECEIVER_EMAIL,
    subject: `New Message from ${name}: ${subject}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}

      Message: ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`New message from ${req.name} sent successfully`);
    res.status(201).json({
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(400).json({
      valid: false,
      error: `Message failed to send.`,
    });
  }
}));

export default router;
