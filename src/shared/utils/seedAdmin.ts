import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt"
import config from "../../config"
import prisma from "../../lib/prisma"


export const seedAdmin = async () => {
    const admin = await prisma.user.findUnique({
        where: {
            email: config.admin.email
        },
        select: {
            role: true
        }
    });

    if (!admin) {
        const hashedPassword = await bcrypt.hash(config.admin.password!, 10)
        await prisma.user.create({
            data: {
                fullName: "Mr. Admin",
                role: UserRole.ADMIN,
                email: config.admin.email!,
                password: hashedPassword,
                profileImage: "https://i.ibb.co.com/vC0htHb9/emma-Watson.jpg",
                isEmailVerified: true
            }
        })
        console.log("🧙‍♂️ Admin seeded successfully!")
    }

}