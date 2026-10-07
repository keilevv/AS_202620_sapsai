import nodemailer from "nodemailer";
import { Booking, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function generateConfirmationToken(bookingId: string): string {
  return jwt.sign(
    { bookingId, action: 'confirm-booking' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function sendBookingConfirmation(
  booking: Booking,
  userEmail: string
): Promise<boolean> {
  try {
    const bookingDate = new Date(booking.date).toLocaleDateString();
    const startTime = new Date(booking.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = new Date(booking.endTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const confirmationToken = generateConfirmationToken(booking.id);
    const confirmationLink = `${FRONTEND_URL}/confirm-booking?token=${encodeURIComponent(confirmationToken)}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Diving Center"}" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to: userEmail,
      subject: "Please confirm your booking",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
          .button {
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #0066cc; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .footer { margin-top: 20px; font-size: 0.9em; color: #666; text-align: center; }
          .details { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .detail-row { margin-bottom: 8px; }
          .status-pending { color: #e67e22; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Booking Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for your booking with us! Please confirm your booking by clicking the button below:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${confirmationLink}" class="button">Confirm Booking</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0066cc;">${confirmationLink}</p>
          
          <div class="details">
            <h3>Booking Details:</h3>
            <div class="detail-row"><strong>Course:</strong> ${booking.courseTitle}</div>
            <div class="detail-row"><strong>Date:</strong> ${bookingDate}</div>
            <div class="detail-row"><strong>Time:</strong> ${startTime} - ${endTime}</div>
            <div class="detail-row"><strong>Number of People:</strong> ${booking.people}</div>
            <div class="detail-row"><strong>Status:</strong> <span class="status-pending">${booking.status}</span></div>
            <div class="detail-row"><strong>Booking ID:</strong> ${booking.id}</div>
          </div>
          
          <p>This confirmation link will expire in 7 days.</p>
          <p>If you did not make this booking, please ignore this email.</p>
          
          <div class="footer">
            <p>Best regards,<br>The Diving Center Team</p>
            <p><small>This is an automated email, please do not reply.</small></p>
          </div>
        </div>
      </body>
      </html>
        <p>Best regards,<br>Diving Center Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return false;
  }
}
