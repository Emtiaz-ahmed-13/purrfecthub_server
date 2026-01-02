import nodemailer from "nodemailer";

// Email templates
const templates = {
  adoptionSubmitted: (catName: string, shelterName: string) => ({
    subject: `Adoption Application Submitted - ${catName}`,
    html: `
      <h2>Your adoption application has been submitted!</h2>
      <p>Thank you for applying to adopt <strong>${catName}</strong> from <strong>${shelterName}</strong>.</p>
      <p>The shelter will review your application and get back to you soon.</p>
      <p>Best regards,<br>PurrfectHub Team</p>
    `,
  }),

  adoptionApproved: (catName: string, shelterName: string) => ({
    subject: `🎉 Adoption Approved - ${catName}`,
    html: `
      <h2>Congratulations!</h2>
      <p>Your adoption application for <strong>${catName}</strong> has been approved by <strong>${shelterName}</strong>!</p>
      <p>The shelter will contact you soon with next steps.</p>
      <p>Best regards,<br>PurrfectHub Team</p>
    `,
  }),

  adoptionRejected: (catName: string, shelterName: string) => ({
    subject: `Adoption Application Update - ${catName}`,
    html: `
      <h2>Application Update</h2>
      <p>Unfortunately, your adoption application for <strong>${catName}</strong> was not approved at this time.</p>
      <p>Don't give up! There are many other cats looking for loving homes.</p>
      <p>Best regards,<br>PurrfectHub Team</p>
    `,
  }),

  vaccinationReminder: (catName: string, vaccineName: string, dueDate: string) => ({
    subject: `Vaccination Reminder - ${catName}`,
    html: `
      <h2>Vaccination Reminder</h2>
      <p><strong>${catName}</strong> is due for <strong>${vaccineName}</strong> on <strong>${dueDate}</strong>.</p>
      <p>Please schedule an appointment with your veterinarian.</p>
      <p>Best regards,<br>PurrfectHub Team</p>
    `,
  }),

  donationReceived: (amount: number, donor: string) => ({
    subject: `New Donation Received - $${amount}`,
    html: `
      <h2>Thank You for Your Donation!</h2>
      <p>You received a donation of <strong>$${amount}</strong> from <strong>${donor}</strong>.</p>
      <p>This will help provide care for cats in need.</p>
      <p>Best regards,<br>PurrfectHub Team</p>
    `,
  }),

  welcome: (name: string) => ({
    subject: "Welcome to PurrfectHub!",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for joining PurrfectHub, your gateway to finding the perfect feline companion.</p>
      <p>Start browsing available cats and find your new best friend!</p>
      <p>Best regards,<br>PurrfectHub Team</p>
    `,
  }),
};

// Create transporter (configure based on environment)
const createTransporter = () => {
  // For production, use actual SMTP credentials
  // For development, use ethereal.email or similar
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Skip if no SMTP configured
    if (!process.env.SMTP_USER) {
      console.log(`[Email Service] Would send to ${to}: ${subject}`);
      return { success: true, skipped: true };
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"PurrfectHub" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[Email Service] Sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error("[Email Service] Error:", error);
    return { success: false, error };
  }
};

// Helper functions for each email type
const sendAdoptionSubmittedEmail = async (to: string, catName: string, shelterName: string) => {
  const { subject, html } = templates.adoptionSubmitted(catName, shelterName);
  return sendEmail(to, subject, html);
};

const sendAdoptionApprovedEmail = async (to: string, catName: string, shelterName: string) => {
  const { subject, html } = templates.adoptionApproved(catName, shelterName);
  return sendEmail(to, subject, html);
};

const sendAdoptionRejectedEmail = async (to: string, catName: string, shelterName: string) => {
  const { subject, html } = templates.adoptionRejected(catName, shelterName);
  return sendEmail(to, subject, html);
};

const sendVaccinationReminderEmail = async (
  to: string,
  catName: string,
  vaccineName: string,
  dueDate: string
) => {
  const { subject, html } = templates.vaccinationReminder(catName, vaccineName, dueDate);
  return sendEmail(to, subject, html);
};

const sendDonationReceivedEmail = async (to: string, amount: number, donor: string) => {
  const { subject, html } = templates.donationReceived(amount, donor);
  return sendEmail(to, subject, html);
};

const sendWelcomeEmail = async (to: string, name: string) => {
  const { subject, html } = templates.welcome(name);
  return sendEmail(to, subject, html);
};

export const EmailService = {
  sendEmail,
  sendAdoptionSubmittedEmail,
  sendAdoptionApprovedEmail,
  sendAdoptionRejectedEmail,
  sendVaccinationReminderEmail,
  sendDonationReceivedEmail,
  sendWelcomeEmail,
};
