import { Skill, SkillSource } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

export const SkillService = {
    create: async (userId: string, payload: Skill) => {
        const skillExists = await prisma.skill.findUnique({
            where: {
                userId_skillName: {
                    userId,
                    skillName: payload.skillName
                }
            }
        });
        if (skillExists) {
            throw new ApiError(httpStatus.CONFLICT, "You already have this skill!")
        }
        const result = await prisma.skill.create({
            data: {
                ...payload,
                userId
            }
        })
        return result
    },
    getMy: async (userId: string, query: Record<string, unknown>) => {

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
        }

        const skillQuery = new QueryBuilder(prisma.skill, query)
            .search(["skillName", "skillCategory"])
            .filter()
            .rawFilter({ userId })
            .paginate()
            .sort()
            .select({
                id: true,
                skillName: true,
                skillCategory: true,
                proficiencyLevel: true,
                yearOfExperience: true,
                source: true,
                createdAt: true
            });

        const [skills, meta] = await Promise.all([
            skillQuery.execute(),
            skillQuery.countTotal()
        ]);

        // Group AFTER filtering + pagination
        const groupedSkills = skills.reduce((acc: any, skill: any) => {
            if (!acc[skill.skillCategory]) {
                acc[skill.skillCategory] = [];
            }

            acc[skill.skillCategory].push(skill);
            return acc;
        }, {} as Record<string, typeof skills>);

        return {
            meta,
            data: groupedSkills
        };
    }
}