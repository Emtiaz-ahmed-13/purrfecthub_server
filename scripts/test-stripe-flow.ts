import dotenv from 'dotenv';
import path from 'path';
import { DonationServices } from '../src/app/modules/Donation/donation.services';
import prisma from '../src/app/shared/prisma';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testStripeFlow = async () => {
  console.log('🧪 Testing Stripe Payment Flow...');

  try {
    // 1. Check if Stripe Key is present
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️ WARNING: STRIPE_SECRET_KEY is missing in .env');
      console.warn('   The test will likely fail with a Stripe authentication error.');
    } else {
      console.log('✅ STRIPE_SECRET_KEY found.');
    }

    // 2. Create a dummy donation
    console.log('Attempting to create a donation session...');
    const result = await DonationServices.createDonation(null, {
        amount: 50,
        message: "Test donation from terminal",
        isAnonymous: true
    });

    console.log('✅ Donation Creation Request Success!');
    console.log('--------------------------------------------------');
    console.log('Payment URL:', result.paymentUrl);
    console.log('Donation ID:', result.donation.id);
    console.log('Stripe Session ID:', result.donation.stripeSessionId);
    console.log('--------------------------------------------------');
    console.log('To fully verify, you would open the URL, pay, and then call verifyStripePayment.');

  } catch (error: any) {
    console.error('❌ Test Failed:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.log('💡 TIP: You need to add a valid STRIPE_SECRET_KEY to your .env file.');
    }
  } finally {
    await prisma.$disconnect();
  }
};

testStripeFlow();
