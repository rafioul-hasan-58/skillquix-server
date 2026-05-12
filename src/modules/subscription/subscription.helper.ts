import prisma from "../../lib/prisma";

export const monthlyRevenue = async () => {
    // 1️⃣ Get current month range
    const now = new Date();

    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    );

    // 2️⃣ Aggregate revenue
    const monthlyRevenue = await prisma.invoice.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: "PAID", // or InvoiceStatus.PAID
            createdAt: {
                gte: startOfMonth,
                lt: startOfNextMonth,
            },
        },
    });
    return monthlyRevenue._sum.amount ?? 0
}