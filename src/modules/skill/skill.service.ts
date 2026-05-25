import { Skill } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../app/errors/ApiError";
import httpStatus from "http-status";
import QueryBuilder from "../../infrastructure/builder/QueryBuilder";

const create = async (userId: string, payload: Skill) => {
    const result = await prisma.skill.upsert({
        where: {
            userId_skillName: {
                userId,
                skillName: payload.skillName
            },
        },
        update: {
            ...payload,
            userId
        },
        create: {
            ...payload,
            userId
        }

    })
    return result
};

const createMany = async (userId: string, payload: { skills: Skill[] }) => {
    // fetch existing skills for this user
    const existingSkills = await prisma.skill.findMany({
        where: { userId },
        select: { skillName: true },
    });

    const existingSkillNames = new Set(existingSkills.map((s) => s.skillName));

    // filter out skills that already exist
    const newSkills = payload.skills
        .filter((skill) => !existingSkillNames.has(skill.skillName))
        .map((skill) => ({
            ...skill,
            userId,
        }));

    if (newSkills.length === 0) {
        return { message: "All skills already exist", count: 0 };
    }

    const result = await prisma.skill.createMany({
        data: newSkills,
    });

    return result;
};

const getMy = async (userId: string, query: Record<string, unknown>) => {

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
};

const details = async (skillId: string) => {
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
};

const updateSkill = async (skillId: string, payload: Partial<Skill>) => {
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
};

const deleteSkill = async (skillId: string) => {
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
};

const topSkills = async () => {
    const skills = await prisma.skill.findMany();

    // Count how many skills per category
    const categoryCounts: Record<string, number> = {};

    for (const skill of skills) {
        const category = skill.skillCategory;
        if (category) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
    }

    // Sort categories by count descending
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

    // Take top 3 
    const top3 = sortedCategories.slice(0, 3);

    // Total skills count
    const totalCount = sortedCategories.reduce((sum, [, count]) => sum + count, 0);

    if (totalCount === 0) return {};

    // Prepare result
    const result: Record<string, number> = {};

    for (const [category, count] of top3) {
        result[category] = Math.round((count / totalCount) * 100);
    }

    // Sum remaining categories as Others
    const othersCount = sortedCategories.slice(3).reduce((sum, [, count]) => sum + count, 0);
    if (othersCount > 0) {
        result["Others"] = Math.round((othersCount / totalCount) * 100);
    }

    return result;
};
const findDuplicateSkills = async (userId: string) => {
    // fetch ALL skills from the entire collection
    const skills = await prisma.skill.findMany();

    // group by userId + skillName combination
    const grouped = skills.reduce((acc, skill) => {
        const key = `${skill.userId}__${skill.skillName}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(skill);
        return acc;
    }, {} as Record<string, typeof skills>);

    // collect all deleteIds — keep first, delete the rest
    const deleteIds = Object.values(grouped)
        .filter((group) => group.length > 1)
        .flatMap((group) => group.slice(1).map((s) => s.id));

    if (deleteIds.length === 0) {
        return { message: "No duplicates found across all users", deleted: 0 };
    }

    const deleted = await prisma.skill.deleteMany({
        where: {
            id: { in: deleteIds },
        },
    });

    return {
        message: `Removed ${deleted.count} duplicate skills across all users`,
        deleted: deleted.count,
    };
};
export const SkillService = {
    create,
    createMany,
    getMy,
    details,
    updateSkill,
    deleteSkill,
    topSkills,
    findDuplicateSkills
}