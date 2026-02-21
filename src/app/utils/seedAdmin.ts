import { UserRole } from "@prisma/client";
import config from "../../config"
import prisma from "../lib/prisma"
import bcrypt from "bcrypt"

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
                profileImage: "https://i.ibb.co.com/vC0htHb9/emma-Watson.jpg"
            }
        })
        console.log("🧙‍♂️ Admin seeded successfully!")
    }

}