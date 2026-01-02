import config from "../../../config";
import stripe from "../../../helpers/stripe";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

type TCreateDonation = {
  amount: number;
  message?: string;
  isAnonymous?: boolean;
  shelterId?: string;
  catId?: string;
};

const createDonation = async (donorId: string | null, payload: TCreateDonation) => {
  // 1. Verify shelter or cat exists
  let shelterName = "General Donation";
  let catName = "";

  if (payload.shelterId) {
    const shelter = await prisma.shelter.findUnique({
      where: { id: payload.shelterId },
    });
    if (!shelter) {
      throw new ApiError(404, "Shelter not found");
    }
    shelterName = shelter.name;
  }

  if (payload.catId) {
    const cat = await prisma.cat.findUnique({
      where: { id: payload.catId },
    });
    if (!cat) {
      throw new ApiError(404, "Cat not found");
    }
    catName = ` for ${cat.name}`;
  }

  // 2. Create Donation Record (Initial Status: PENDING)
  const donation = await prisma.donation.create({
    data: {
      amount: payload.amount,
      message: payload.message,
      isAnonymous: payload.isAnonymous || false,
      donorId,
      shelterId: payload.shelterId,
      catId: payload.catId,
      status: "PENDING",
    },
  });

  // 3. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Donation to ${shelterName}${catName}`,
            description: payload.message || "Thank you for your support!",
          },
          unit_amount: Math.round(payload.amount * 100), // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.env === "production" ? "https://your-frontend.com" : "http://localhost:3000"}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.env === "production" ? "https://your-frontend.com" : "http://localhost:3000"}/donations/cancel`,
    metadata: {
      donationId: donation.id,
    },
  });

  // 4. Update Donation with Session ID
  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      stripeSessionId: session.id,
    },
  });

  return {
    donation,
    paymentUrl: session.url,
  };
};

const verifyStripePayment = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    const donationId = session.metadata?.donationId;

    if (!donationId) {
      throw new ApiError(400, "Invalid session metadata");
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      throw new ApiError(404, "Donation record not found");
    }

    if (donation.status === "COMPLETED") {
      return { message: "Payment already verified", donation };
    }

    // Update status to COMPLETED
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: "COMPLETED",
        stripePaymentId: session.payment_intent as string,
      },
      include: {
        shelter: { select: { id: true, name: true, userId: true } },
        cat: { select: { id: true, name: true } },
        donor: { select: { id: true, name: true } },
      },
    });

    // Send Notification to Shelter
    if (updatedDonation.shelterId && updatedDonation.shelter) {
      await prisma.notification.create({
        data: {
          userId: updatedDonation.shelter.userId,
          title: "New Donation Received! 💰",
          message: `You received a donation of $${updatedDonation.amount}${updatedDonation.cat ? ` for ${updatedDonation.cat.name}` : ""}.`,
          type: "DONATION",
        },
      });
    }

    // Send Email Notification (if email service exists)
    // TODO: Integrate EmailService.sendDonationReceivedEmail(...)

    return { message: "Payment verified successfully", donation: updatedDonation };
  } else {
    throw new ApiError(400, "Payment not completed");
  }
};

const getMyDonations = async (donorId: string) => {
  const donations = await prisma.donation.findMany({
    where: { donorId },
    orderBy: { createdAt: "desc" },
    include: {
      shelter: { select: { id: true, name: true } },
      cat: { select: { id: true, name: true } },
    },
  });

  return donations;
};

const getShelterDonations = async (userId: string) => {
  const shelter = await prisma.shelter.findUnique({
    where: { userId },
  });

  if (!shelter) {
    throw new ApiError(404, "Shelter profile not found");
  }

  const donations = await prisma.donation.findMany({
    where: {
      OR: [
        { shelterId: shelter.id },
        { cat: { shelterId: shelter.id } },
      ],
      status: "COMPLETED",
    },
    orderBy: { createdAt: "desc" },
    include: {
      donor: {
        select: { id: true, name: true },
      },
      cat: { select: { id: true, name: true } },
    },
  });

  // Calculate totals
  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  return {
    donations: donations.map((d) => ({
      ...d,
      donor: d.isAnonymous ? null : d.donor,
    })),
    total,
  };
};

const getDonationStats = async () => {
  const [totalDonations, totalAmount, recentDonations] = await Promise.all([
    prisma.donation.count({ where: { status: "COMPLETED" } }),
    prisma.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.donation.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        shelter: { select: { id: true, name: true } },
        cat: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    totalDonations,
    totalAmount: totalAmount._sum.amount || 0,
    recentDonations,
  };
};

export const DonationServices = {
  createDonation,
  verifyStripePayment,
  getMyDonations,
  getShelterDonations,
  getDonationStats,
};
