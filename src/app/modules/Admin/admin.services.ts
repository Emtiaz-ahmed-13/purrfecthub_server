import prisma from "../../shared/prisma";

const getAnalytics = async () => {
    const [totalUsers, totalCats, totalShelters, totalDonations] = await Promise.all([
        prisma.user.count(),
        prisma.cat.count(),
        prisma.shelter.count(),
        prisma.donation.aggregate({
            _sum: {
                amount: true
            },
            where: {
                status: "COMPLETED"
            }
        })
    ]);

    const sheltersWithCatCount = await prisma.shelter.findMany({
        select: {
            id: true,
            name: true,
            user: {
                select: {
                    email: true
                }
            },
            _count: {
                select: {
                    cats: true
                }
            }
        },
        orderBy: {
            cats: {
                _count: 'desc'
            }
        }
    });

    return {
        totalUsers,
        totalCats,
        totalShelters,
        totalDonations: totalDonations._sum.amount || 0,
        shelters: sheltersWithCatCount.map(s => ({
            id: s.id,
            name: s.name,
            email: s.user.email,
            catCount: s._count.cats
        }))
    };
};

export const AdminServices = {
    getAnalytics
};
