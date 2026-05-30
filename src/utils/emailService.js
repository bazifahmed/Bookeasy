// src/utils/emailService.js

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "BookEasy <noreply@yourdomain.com>"; // ← change to your verified Resend sender

/**
 * Sends booking confirmation to client + notification to business owner.
 * Uses Resend API directly via fetch() — no backend required.
 */
export async function sendBookingConfirmation({
  clientName,
  clientEmail,
  businessName,
  serviceName,
  date,
  time,
  price,
  ownerEmail,
  clientPhone = "Not provided",
}) {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    console.error("VITE_RESEND_API_KEY is not set.");
    throw new Error("Email service is not configured.");
  }

  const sendEmail = async (payload) => {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Resend API error: ${error.message || res.statusText}`);
    }

    return res.json();
  };

  // ── 1. Client Confirmation Email ──────────────────────────────────────────

  const clientHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; border-radius: 20px; padding: 4px 14px; font-size: 13px; margin-top: 12px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 17px; color: #374151; margin-bottom: 24px; line-height: 1.6; }
    .details-card { background: #f8f7ff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; margin-bottom: 28px; }
    .details-card h2 { margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #6d28d9; font-weight: 600; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ede9fe; font-size: 15px; }
    .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
    .detail-label { color: #6b7280; font-weight: 500; }
    .detail-value { color: #111827; font-weight: 600; text-align: right; max-width: 60%; }
    .price-row .detail-value { color: #4f46e5; font-size: 17px; }
    .calendar-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 18px 22px; margin-bottom: 28px; display: flex; align-items: flex-start; gap: 14px; }
    .calendar-icon { font-size: 28px; flex-shrink: 0; }
    .calendar-box h3 { margin: 0 0 4px; font-size: 14px; color: #065f46; font-weight: 600; }
    .calendar-box p { margin: 0; font-size: 13px; color: #047857; line-height: 1.5; }
    .footer-note { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 8px; }
    .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .brand { color: #4f46e5; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>✅ Booking Confirmed!</h1>
      <p>You're all set at <strong>${businessName}</strong></p>
      <span class="badge">Confirmation Received</span>
    </div>
    <div class="body">
      <p class="greeting">
        Hi <strong>${clientName}</strong>,<br/>
        Great news — your appointment has been confirmed. We look forward to seeing you!
        Here's a summary of your booking details:
      </p>

      <div class="details-card">
        <h2>📋 Booking Summary</h2>
        <div class="detail-row">
          <span class="detail-label">Business</span>
          <span class="detail-value">${businessName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${serviceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${time}</span>
        </div>
        <div class="detail-row price-row">
          <span class="detail-label">Price</span>
          <span class="detail-value">${price}</span>
        </div>
      </div>

      <div class="calendar-box">
        <span class="calendar-icon">📅</span>
        <div>
          <h3>Add to your calendar</h3>
          <p>
            Open your preferred calendar app (Google Calendar, Apple Calendar, or Outlook)
            and add a reminder for <strong>${date} at ${time}</strong> so you never miss your appointment.
          </p>
        </div>
      </div>

      <p class="footer-note">
        Need to reschedule or cancel? Contact <strong>${businessName}</strong> directly as soon as possible.
      </p>
      <p class="footer-note">
        See you soon! 🎉
      </p>
    </div>
    <div class="footer">
      <p>This confirmation was sent by <span class="brand">BookEasy</span> on behalf of ${businessName}.<br/>
      Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // ── 2. Owner Notification Email ───────────────────────────────────────────

  const ownerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Booking</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%); padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
    .body { padding: 32px; }
    .alert-box { background: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; font-size: 14px; color: #134e4a; line-height: 1.5; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #0891b2; font-weight: 700; margin-bottom: 12px; }
    .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
    .detail-label { color: #64748b; }
    .detail-value { color: #0f172a; font-weight: 600; text-align: right; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 0; font-size: 12px; color: #94a3b8; }
    .brand { color: #0891b2; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🔔 New Booking!</h1>
      <p>A client just booked through BookEasy</p>
    </div>
    <div class="body">
      <div class="alert-box">
        You have a new appointment. Review the details below and make sure the slot is prepared.
      </div>

      <div class="details-card">
        <div class="section-title">👤 Client Details</div>
        <div class="detail-row">
          <span class="detail-label">Name</span>
          <span class="detail-value">${clientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${clientEmail}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone</span>
          <span class="detail-value">${clientPhone}</span>
        </div>
      </div>

      <div class="details-card">
        <div class="section-title">📋 Booking Details</div>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${serviceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Price</span>
          <span class="detail-value">${price}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Sent via <span class="brand">BookEasy</span> · Manage your bookings in your dashboard</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // ── 3. Fire both emails in parallel ──────────────────────────────────────

  const [clientResult, ownerResult] = await Promise.allSettled([
    sendEmail({
      from: FROM_ADDRESS,
      to: [clientEmail],
      subject: `Your booking at ${businessName} is confirmed!`,
      html: clientHtml,
    }),
    sendEmail({
      from: FROM_ADDRESS,
      to: [ownerEmail],
      subject: `New booking from ${clientName}`,
      html: ownerHtml,
    }),
  ]);

  // Surface any failures without blocking the booking flow
  if (clientResult.status === "rejected") {
    console.error("Failed to send client confirmation:", clientResult.reason);
  }
  if (ownerResult.status === "rejected") {
    console.error("Failed to send owner notification:", ownerResult.reason);
  }

  return {
    clientEmailSent: clientResult.status === "fulfilled",
    ownerEmailSent: ownerResult.status === "fulfilled",
  };
}