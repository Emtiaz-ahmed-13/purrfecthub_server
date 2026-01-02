import dotenv from 'dotenv';
import path from 'path';
import { EmailService } from '../src/helpers/emailService';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testEmail = async () => {
  console.log('Testing Email Service...');
  console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`SMTP User: ${process.env.SMTP_USER}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials missing in .env');
    return;
  }

  // Use the SMTP user as the recipient for the test
  const recipient = process.env.SMTP_USER; 
  
  console.log(`Sending test email to ${recipient}...`);

  const result = await EmailService.sendWelcomeEmail(recipient, 'Test User');

  if (result.success) {
    console.log('✅ Email sent successfully!');
  } else {
    console.error('❌ Failed to send email:', result.error);
  }
};

testEmail();
