import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

export const sendVerificationEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from:    `"MindMap" <${process.env.MAIL_USER}>`,
    to,
    subject: "Verify your MindMap account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0d9488">Welcome to MindMap</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#888;font-size:12px">Link expires in 24 hours.</p>
      </div>
    `,
  });
};

export const sendAppointmentConfirmation = async (to, { name, resourceName, date, slot }) => {
  await transporter.sendMail({
    from:    `"MindMap" <${process.env.MAIL_USER}>`,
    to,
    subject: `Appointment confirmed — ${resourceName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0d9488">Appointment Confirmed</h2>
        <p>Hi ${name}, your appointment has been confirmed.</p>
        <div style="background:#f0fdf9;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:4px 0"><strong>Resource:</strong> ${resourceName}</p>
          <p style="margin:4px 0"><strong>Date:</strong> ${date}</p>
          <p style="margin:4px 0"><strong>Time:</strong> ${slot}</p>
        </div>
        <p style="color:#888;font-size:12px">Please arrive 5 minutes early.</p>
      </div>
    `,
  });
};

export const sendAppointmentCancellation = async (to, { name, resourceName, date, slot }) => {
  await transporter.sendMail({
    from:    `"MindMap" <${process.env.MAIL_USER}>`,
    to,
    subject: `Appointment cancelled — ${resourceName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#e11d48">Appointment Cancelled</h2>
        <p>Hi ${name}, your appointment has been cancelled.</p>
        <div style="background:#fff1f2;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:4px 0"><strong>Resource:</strong> ${resourceName}</p>
          <p style="margin:4px 0"><strong>Date:</strong> ${date}</p>
          <p style="margin:4px 0"><strong>Time:</strong> ${slot}</p>
        </div>
      </div>
    `,
  });
};