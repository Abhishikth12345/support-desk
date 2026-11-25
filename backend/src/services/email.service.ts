import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface CredentialsEmailParams {
  to: string;
  name: string;
  role: string;
  password?: string;
  isCreatedByAdmin: boolean;
}

interface TicketAssignmentEmailParams {
  to: string;
  agentName: string;
  ticketNumber: string;
  title: string;
  priority: string;
  category: string;
  ticketId: string;
}

// Cached transporter
let transporter: Transporter | null = null;

const getTransporter = async (): Promise<Transporter> => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587");

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  }

  // Fallback: Ethereal test account for development/preview
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[EMAIL SERVICE] Initialized with test SMTP account: ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.warn("[EMAIL SERVICE] Could not create Ethereal account, using console logger fallback:", err);
    // Minimal mock transporter that logs
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "windows",
    });
    return transporter;
  }
};

export const sendWelcomeCredentialsEmail = async (params: CredentialsEmailParams): Promise<boolean> => {
  const { to, name, role, password, isCreatedByAdmin } = params;
  const clientUrl = process.env.CLIENT_URL || "https://support-desk-abhi-1402.vercel.app";
  const loginUrl = `${clientUrl}/login`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your SupportDesk Account Credentials</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0e17; color: #f3f4f6; margin: 0; padding: 30px 15px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #111622; border: 1px solid #1f293d; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="background-color: #0c101a; padding: 24px 30px; border-bottom: 1px solid #1f293d; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">SupportDesk</h1>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Customer Support &amp; Issue Resolution Platform</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Welcome, ${name}!</h2>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        ${
          isCreatedByAdmin
            ? `An administrator has provisioned a <strong>${role.toUpperCase()}</strong> workspace account for you on SupportDesk.`
            : `Your SupportDesk account has been successfully created with the <strong>${role.toUpperCase()}</strong> role.`
        }
      </p>

      <div style="background-color: #0c101a; border: 1px solid #1f293d; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #818cf8;">Your Login Credentials</h3>
        
        <table style="width: 100%; font-size: 13px; color: #e2e8f0; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; width: 120px;">Email:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 600; color: #ffffff;">${to}</td>
          </tr>
          ${
            password
              ? `<tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Password:</td>
                  <td style="padding: 6px 0; font-family: monospace; font-weight: 600; color: #38bdf8; background-color: #1e293b; padding: 4px 8px; border-radius: 6px; display: inline-block;">${password}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Assigned Role:</td>
            <td style="padding: 6px 0; text-transform: capitalize; font-weight: 600; color: #34d399;">${role}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; display: inline-block;">
          Sign In to SupportDesk
        </a>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; border-top: 1px solid #1f293d; padding-top: 18px;">
        ${
          isCreatedByAdmin
            ? "For security purposes, we recommend changing your temporary password immediately upon signing in."
            : "Keep your credentials secure. If you did not create this account, please ignore this email."
        }
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const mailClient = await getTransporter();
    const info = await mailClient.sendMail({
      from: `"SupportDesk Portal" <${process.env.EMAIL_FROM || "no-reply@supportdesk.internal"}>`,
      to,
      subject: isCreatedByAdmin
        ? `Your SupportDesk Account Credentials [${role.toUpperCase()}]`
        : "Welcome to SupportDesk - Account Credentials",
      html: htmlContent,
    });

    console.log(`[EMAIL SERVICE] Credentials email sent to ${to}. MessageId: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL PREVIEW URL]: ${previewUrl}`);
    }
    return true;
  } catch (err) {
    console.error("[EMAIL SERVICE] Failed to send credentials email:", err);
    return false;
  }
};

export const sendTicketAssignmentEmail = async (params: TicketAssignmentEmailParams): Promise<boolean> => {
  const { to, agentName, ticketNumber, title, priority, category, ticketId } = params;
  const clientUrl = process.env.CLIENT_URL || "https://support-desk-abhi-1402.vercel.app";
  const ticketUrl = `${clientUrl}/dashboard/tickets/${ticketId}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Ticket Assigned to You</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0e17; color: #f3f4f6; margin: 0; padding: 30px 15px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #111622; border: 1px solid #1f293d; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="background-color: #0c101a; padding: 24px 30px; border-bottom: 1px solid #1f293d;">
      <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700;">SupportDesk Triage Notice</h1>
      <p style="margin: 4px 0 0; color: #818cf8; font-size: 12px; font-weight: 600;">Ticket Assignment Alert</p>
    </div>

    <div style="padding: 30px;">
      <p style="color: #cbd5e1; font-size: 14px; margin-top: 0;">
        Hello <strong>${agentName}</strong>,
      </p>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        You have been assigned as the specialist responsible for the following support ticket:
      </p>

      <div style="background-color: #0c101a; border: 1px solid #1f293d; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #818cf8; margin-bottom: 6px;">
          ${ticketNumber}
        </div>
        <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 12px;">
          ${title}
        </div>
        <div style="display: flex; gap: 10px; font-size: 12px;">
          <span style="background-color: #1e1b4b; color: #a5b4fc; border: 1px solid #3730a3; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
            ${category}
          </span>
          <span style="background-color: #1c1917; color: #f59e0b; border: 1px solid #78350f; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
            ${priority}
          </span>
        </div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${ticketUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 10px; font-size: 13px; font-weight: 600; display: inline-block;">
          View &amp; Resolve Ticket
        </a>
      </div>

      <p style="color: #64748b; font-size: 11px; margin: 0; border-top: 1px solid #1f293d; padding-top: 14px;">
        This automated notification was generated by the SupportDesk ticket triage system.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const mailClient = await getTransporter();
    const info = await mailClient.sendMail({
      from: `"SupportDesk Notifications" <${process.env.EMAIL_FROM || "no-reply@supportdesk.internal"}>`,
      to,
      subject: `[Assigned] Ticket ${ticketNumber}: ${title}`,
      html: htmlContent,
    });

    console.log(`[EMAIL SERVICE] Assignment email sent to ${to}. MessageId: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL PREVIEW URL]: ${previewUrl}`);
    }
    return true;
  } catch (err) {
    console.error("[EMAIL SERVICE] Failed to send assignment email:", err);
    return false;
  }
};
