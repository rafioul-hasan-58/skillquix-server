import { Skill, SkillSource } from "@prisma/client";
import prisma from "../../lib/prisma";

export const SkillService = {
    create: async (userId:string,payload: Skill) => {
        const result = await prisma.skill.create({
            data: {
                ...payload,
                source: SkillSource.MANUAL,
                userId
            }
        })
        return result
    }
}