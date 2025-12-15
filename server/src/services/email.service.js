import nodemailer from "nodemailer";

export const buildMailer = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const formatDate = (scheduledAt, timeZone = "UTC") => {
  const date = new Date(scheduledAt);
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
  return { datePart, timePart };
};

export const sendMeetingInviteEmail = async ({
  to,
  jobTitle,
  companyName = "Zepul",
  candidateName = "",
  scheduledAt,
  timeZone = "UTC",
  durationMinutes = 40,
  inviteLink,
  mode = "Video Call (AI-led interview)",
  locationLabel = "Meeting Link",
  interviewerNames = "",
  recruiterFullName = "",
  recruiterTitle = "",
  recruiterPhone = "",
  recruiterEmail = "",
  companyWebsite = "",
}) => {
  const transporter = buildMailer();
  const { datePart, timePart } = formatDate(scheduledAt, timeZone);

  const subject = `Interview Invitation – ${jobTitle} at ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 720px; line-height: 1.6;">
      <h2 style="color:#2563eb; margin-bottom: 12px;">Interview Invitation – ${jobTitle} at ${companyName}</h2>
      <p>Dear ${candidateName || "Candidate"},</p>
      <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. We were impressed with your profile and would like to move forward by scheduling an interview with you.</p>
      <h3 style="margin-top: 20px;">Interview details</h3>
      <ul style="padding-left: 18px; margin-top: 8px; margin-bottom: 16px;">
        <li><strong>Date:</strong> ${datePart}</li>
        <li><strong>Time:</strong> ${timePart} (${timeZone})</li>
        <li><strong>Mode:</strong> ${mode}</li>
        <li><strong>${locationLabel}:</strong> <a href="${inviteLink}" style="color:#2563eb;">${inviteLink}</a></li>
        <li><strong>Interviewer(s):</strong> ${interviewerNames || "Our AI Interviewer"}</li>
        <li><strong>Interview Duration:</strong> Approximately ${durationMinutes} minutes</li>
      </ul>
      <p>Please confirm your availability for the above schedule by replying to this email. If the proposed time does not work for you, feel free to suggest an alternative and we will do our best to accommodate.</p>
      <p>If you have any questions or require additional information prior to the interview, don’t hesitate to reach out.</p>
      <p>We look forward to speaking with you.</p>
      <p>Best regards,<br/>
         ${recruiterFullName || "[Your Full Name]"}${recruiterTitle ? `, ${recruiterTitle}` : ""}<br/>
         ${companyName}<br/>
         ${recruiterPhone || ""}<br/>
         ${recruiterEmail || ""}<br/>
         ${companyWebsite ? `<a href="${companyWebsite}" style="color:#2563eb;">${companyWebsite}</a>` : ""}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

export const sendMeetingCancelEmail = async ({
  to,
  jobTitle,
  companyName = "Zepul",
  candidateName = "",
  recruiterFullName = "",
  recruiterTitle = "",
  recruiterEmail = "",
  recruiterPhone = "",
  companyWebsite = "",
}) => {
  const transporter = buildMailer();
  const subject = `Interview Update – ${jobTitle} at ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 720px; line-height: 1.6;">
      <h2 style="color:#ef4444; margin-bottom: 12px;">Interview Update – ${jobTitle} at ${companyName}</h2>
      <p>Dear ${candidateName || "Candidate"},</p>
      <p>We wanted to let you know that the interview for the <strong>${jobTitle}</strong> position has been canceled. If needed, we will reach out to reschedule.</p>
      <p>For any questions, please reply to this email.</p>
      <p>Best regards,<br/>
         ${recruiterFullName || "[Your Full Name]"}${recruiterTitle ? `, ${recruiterTitle}` : ""}<br/>
         ${companyName}<br/>
         ${recruiterPhone || ""}<br/>
         ${recruiterEmail || ""}<br/>
         ${companyWebsite ? `<a href="${companyWebsite}" style="color:#2563eb;">${companyWebsite}</a>` : ""}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

export const sendMeetingRescheduleEmail = async ({
  to,
  jobTitle,
  companyName = "Zepul",
  candidateName = "",
  scheduledAt,
  timeZone = "UTC",
  durationMinutes = 40,
  inviteLink,
  mode = "Video Call (AI-led interview)",
  locationLabel = "Meeting Link",
  recruiterFullName = "",
  recruiterTitle = "",
  recruiterEmail = "",
  recruiterPhone = "",
  companyWebsite = "",
}) => {
  const transporter = buildMailer();
  const { datePart, timePart } = formatDate(scheduledAt, timeZone);
  const subject = `Interview Rescheduled – ${jobTitle} at ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 720px; line-height: 1.6;">
      <h2 style="color:#2563eb; margin-bottom: 12px;">Interview Rescheduled – ${jobTitle} at ${companyName}</h2>
      <p>Dear ${candidateName || "Candidate"},</p>
      <p>Your interview for the <strong>${jobTitle}</strong> position has been rescheduled. Please find the updated details below:</p>
      <ul style="padding-left: 18px; margin-top: 8px; margin-bottom: 16px;">
        <li><strong>Date:</strong> ${datePart}</li>
        <li><strong>Time:</strong> ${timePart} (${timeZone})</li>
        <li><strong>Mode:</strong> ${mode}</li>
        <li><strong>${locationLabel}:</strong> <a href="${inviteLink}" style="color:#2563eb;">${inviteLink}</a></li>
        <li><strong>Interview Duration:</strong> Approximately ${durationMinutes} minutes</li>
      </ul>
      <p>Please confirm your availability for the new schedule. If this time does not work for you, feel free to suggest an alternative.</p>
      <p>Best regards,<br/>
         ${recruiterFullName || "[Your Full Name]"}${recruiterTitle ? `, ${recruiterTitle}` : ""}<br/>
         ${companyName}<br/>
         ${recruiterPhone || ""}<br/>
         ${recruiterEmail || ""}<br/>
         ${companyWebsite ? `<a href="${companyWebsite}" style="color:#2563eb;">${companyWebsite}</a>` : ""}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

