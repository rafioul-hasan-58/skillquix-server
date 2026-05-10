import { Skill, SkillSource } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

export const SkillService = {
    create: async (userId: string, payload: Skill) => {
        // const skillExists = await prisma.skill.findUnique({
        //     where: {
        //         userId_skillName: {
        //             userId,
        //             skillName: payload.skillName
        //         }
        //     }
        // });
        // if (skillExists) {
        //     throw new ApiError(httpStatus.CONFLICT, "You already have this skill!")
        // }
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
    },
    details: async (skillId: string) => {
        const skill = await prisma.skill.findUnique({
            where: {
                id: skillId
            },
            select: {
                id: true,
                skillName: true,
                skillCategory: true,
                proficiencyLevel: true,
                yearOfExperience: true,
                source: true
            }
        });
        if (!skill) {
            throw new ApiError(httpStatus.NOT_FOUND, "Skill not found!");
        }
        return skill
    },
    updateSkill: async (skillId: string, payload: Partial<Skill>) => {
        const skill = await prisma.skill.findUnique({
            where: {
                id: skillId
            }
        });
        if (!skill) {
            throw new ApiError(httpStatus.NOT_FOUND, "Skill not found!")
        }
        const result = await prisma.skill.update({
            where: {
                id: skillId
            },
            data: {
                skillCategory: payload.skillCategory,
                skillName: payload.skillName,
                proficiencyLevel: payload.proficiencyLevel,
                yearOfExperience: payload.yearOfExperience,
                source: payload.source
            }
        });

        return result
    },
    deleteSkill: async (skillId: string) => {
        const skill = await prisma.skill.findUnique({
            where: {
                id: skillId
            }
        });
        if (!skill) {
            throw new ApiError(httpStatus.NOT_FOUND, "Skill not found!")
        }
        await prisma.skill.delete({
            where: {
                id: skillId
            }
        });
    },
    topSkills: async () => {
        const skills = await prisma.skill.findMany();

        // Count how many skills per category
        const categoryCounts: Record<string, number> = {};

        for (const skill of skills) {
            const category = skill.skillCategory;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1; // +1 per skill
        }

        // Sort categories by count descending
        const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

        // Take top 3 categories
        const top3 = sortedCategories.slice(0, 3);

        // Total skills count
        const totalCount = sortedCategories.reduce((sum, [, count]) => sum + count, 0);

        // Prepare result
        const result: Record<string, number> = {};

        // Top 3 categories with percentage
        for (const [category, count] of top3) {
            result[category] = Math.round((count / totalCount) * 100);
        }

        // Sum remaining categories as Others
        const othersCount = sortedCategories.slice(3).reduce((sum, [, count]) => sum + count, 0);
        if (othersCount > 0) {
            result["Others"] = Math.round((othersCount / totalCount) * 100);
        }

        return result

    }
}