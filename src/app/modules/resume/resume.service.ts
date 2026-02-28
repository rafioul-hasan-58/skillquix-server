import { Certificate, Education, Experience, Language, OtherLink, Project, Resume, Skill, SkillSource } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { createResume, updateEducation, updateSkill, updateWorkExperience } from "./resume.interface";
import { generateResumeEmbedding, upsertResumeEmbedding } from "./resume.helper";

export const ResumeService = {
    // createResume: async (userId: string, payload: createResume) => {
    //     const {
    //         name,
    //         title,
    //         email,
    //         location,
    //         phone,
    //         summary,
    //         experiences,
    //         education,
    //         skills,
    //     } = payload;

    //     const embedding = await generateResumeEmbedding(payload);

    //     // Delete existing nested records first (for clean upsert)
    //     const existingResume = await prisma.resume.findUnique({
    //         where: { userId },
    //         select: { id: true }
    //     });

    //     if (existingResume) {
    //         // Clean up existing nested data before updating
    //         await prisma.$transaction([
    //             prisma.experience.deleteMany({ where: { resumeId: existingResume.id } }),
    //             prisma.education.deleteMany({ where: { resumeId: existingResume.id } }),
    //             prisma.skill.deleteMany({ where: { resumeId: existingResume.id } }),
    //         ]);
    //     }

    //     const result = await prisma.$transaction(async (tx) => {
    //         const resume = await tx.resume.upsert({
    //             where: { userId },
    //             update: {
    //                 name,
    //                 title,
    //                 email,
    //                 location,
    //                 phone,
    //                 summary,
    //                 embedding,
    //                 experiences: {
    //                     create: experiences?.map((exp: Experience) => ({
    //                         workingRole: exp.workingRole,
    //                         companyName: exp.companyName,
    //                         description: exp.description,
    //                         startDate: exp.startDate,
    //                         endDate: exp.endDate,
    //                     })),
    //                 },
    //                 education: {
    //                     create: education?.map((edu: Education) => ({
    //                         degreeName: edu.degreeName,
    //                         instituteName: edu.instituteName,
    //                         startDate: edu.startDate,
    //                         endDate: edu.endDate,
    //                     })),
    //                 },
    //             },
    //             create: {
    //                 userId,
    //                 name,
    //                 title,
    //                 email,
    //                 location,
    //                 phone,
    //                 summary,
    //                 embedding,
    //                 experiences: {
    //                     create: experiences?.map((exp: Experience) => ({
    //                         workingRole: exp.workingRole,
    //                         companyName: exp.companyName,
    //                         description: exp.description,
    //                         startDate: exp.startDate,
    //                         endDate: exp.endDate,
    //                     })),
    //                 },
    //                 education: {
    //                     create: education?.map((edu: Education) => ({
    //                         degreeName: edu.degreeName,
    //                         instituteName: edu.instituteName,
    //                         startDate: edu.startDate,
    //                         endDate: edu.endDate,
    //                     })),
    //                 },
    //             },
    //             include: {
    //                 experiences: true,
    //                 education: true,
    //             },
    //         });
    //         // Delete old skills
    //         await tx.skill.deleteMany({
    //             where: { resumeId: resume.id }
    //         });

    //         // Create all skills in ONE query
    //         if (skills?.length) {
    //             await tx.skill.createMany({
    //                 data: skills.map(skill => ({
    //                     userId,
    //                     resumeId: resume.id,
    //                     skillName: skill.skillName,
    //                     skillCategory: skill.skillCategory,
    //                     source: "RESUME",
    //                     proficiencyLevel: skill.proficiencyLevel,
    //                     yearOfExperience: skill.yearOfExperience,
    //                 })),
    //             });
    //         }
    //         return resume;
    //     });
    //     const res=await upsertResumeEmbedding(result.id, embedding)
    //     return res

    // },
    createResume: async (userId: string, payload: createResume) => {
        const {
            name, title, email, location, phone, summary,
            experiences, education, skills,
            projects, otherLinks, languages, certificates,
        } = payload;

        // ✅ Do heavy AI call OUTSIDE transaction
        const embedding = await generateResumeEmbedding(payload);

        // ✅ Do all cleanup OUTSIDE transaction first
        const existingResume = await prisma.resume.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (existingResume) {
            // ✅ Cleanup in parallel with Promise.all instead of sequential
            await Promise.all([
                prisma.experience.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.education.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.skill.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.project.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.otherLink.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.language.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.certificate.deleteMany({ where: { resumeId: existingResume.id } }),
            ]);
        }

        // ✅ Now upsert resume (no nested creates needed, children already deleted)
        const resume = await prisma.resume.upsert({
            where: { userId },
            update: { name, title, email, location, phone, summary, embedding },
            create: { userId, name, title, email, location, phone, summary, embedding },
        });

        // ✅ Create all children in parallel with Promise.all — no transaction needed
        await Promise.all([
            experiences?.length
                ? prisma.experience.createMany({
                    data: experiences.map((exp) => ({
                        resumeId: resume.id,
                        workingRole: exp.workingRole,
                        companyName: exp.companyName,
                        description: exp.description,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                    })),
                })
                : Promise.resolve(),

            education?.length
                ? prisma.education.createMany({
                    data: education.map((edu) => ({
                        resumeId: resume.id,
                        degreeName: edu.degreeName,
                        instituteName: edu.instituteName,
                        startDate: edu.startDate,
                        endDate: edu.endDate,
                    })),
                })
                : Promise.resolve(),

            skills?.length
                ? prisma.skill.createMany({
                    data: skills.map((skill) => ({
                        userId,
                        resumeId: resume.id,
                        skillName: skill.skillName,
                        skillCategory: skill.skillCategory,
                        source: "RESUME" as SkillSource,
                        proficiencyLevel: skill.proficiencyLevel,
                        yearOfExperience: skill.yearOfExperience,
                    })),
                })
                : Promise.resolve(),

            projects?.length
                ? prisma.project.createMany({
                    data: projects.map((p) => ({
                        resumeId: resume.id,
                        name: p.name,
                        link: p.link,
                        techStack: p.techStack,
                        description: p.description,
                        startDate: p.startDate,
                        endDate: p.endDate,
                    })),
                })
                : Promise.resolve(),

            otherLinks?.length
                ? prisma.otherLink.createMany({
                    data: otherLinks.map((o) => ({
                        resumeId: resume.id,
                        type: o.type,
                        link: o.link,
                    })),
                })
                : Promise.resolve(),

            languages?.length
                ? prisma.language.createMany({
                    data: languages.map((l) => ({
                        resumeId: resume.id,
                        name: l.name,
                    })),
                })
                : Promise.resolve(),

            certificates?.length
                ? prisma.certificate.createMany({
                    data: certificates.map((c) => ({
                        resumeId: resume.id,
                        name: c.name,
                        issueDate: c.issueDate,
                    })),
                })
                : Promise.resolve(),
        ]);

        // ✅ Upsert embedding after everything is done
        const res = await upsertResumeEmbedding(resume.id, embedding);
        return res;
    },

    deleteResume: async (resumeId: string) => {
        // Check if resume exists
        const resume = await prisma.resume.findUnique({
            where: { id: resumeId },
            select: { id: true },
        });
        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        }

        // Delete resume and all related child records in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // await tx.resumeSkill.deleteMany({ where: { resumeId } });
            // await tx.education.deleteMany({ where: { resumeId } });
            // await tx.experience.deleteMany({ where: { resumeId } });

            const deletedResume = await tx.resume.delete({ where: { id: resumeId } });
            return deletedResume;
        });

        return result;
    },
    getMyResume: async (userId: string) => {
        const result = await prisma.resume.findUnique({
            where: { userId },
            select: {
                id: true, name: true, title: true, email: true,
                location: true, phone: true, summary: true, createdAt: true,
                experiences: { select: { id: true, workingRole: true, companyName: true, description: true, startDate: true, endDate: true, createdAt: true } },
                education: { select: { id: true, degreeName: true, instituteName: true, startDate: true, endDate: true, createdAt: true } },
                skills: { select: { id: true, skillName: true, createdAt: true } },
                projects: { select: { id: true, name: true, link: true, techStack: true, description: true, startDate: true, endDate: true } },        // 👈
                otherLinks: { select: { id: true, type: true, link: true } },       // 👈
                languages: { select: { id: true, name: true } },                    // 👈
                certificates: { select: { id: true, name: true, issueDate: true } } // 👈
            }
        });
        if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        return result;
    },
    updatePersonalInfo: async (resumeId: string, payload: Partial<Resume>) => {
        const resume = await prisma.resume.findUnique({
            where: {
                id: resumeId
            },
            select: {
                id: true
            }
        });

        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        }

        const result = await prisma.resume.update({
            where: {
                id: resumeId
            },
            data: payload
        });
        return result

    },
    addWorkExperience: async (payload: Experience) => {
        const resume = await prisma.resume.findUnique({
            where: {
                id: payload.resumeId
            }
        });
        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not Found!")
        }
        const result = await prisma.experience.create({
            data: {
                resumeId: payload.resumeId,
                workingRole: payload.workingRole,
                companyName: payload.companyName,
                description: payload.description,
                endDate: payload.endDate,
                startDate: payload.startDate
            }
        })

        return result
    },
    addEducation: async (payload: Education) => {
        const resume = await prisma.resume.findUnique({
            where: {
                id: payload.resumeId
            }
        });
        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not Found!")
        }
        const result = await prisma.education.create({
            data: {
                resumeId: payload.resumeId,
                degreeName: payload.degreeName,
                instituteName: payload.instituteName,
                endDate: payload.endDate,
                startDate: payload.startDate
            }
        })
        return result
    },
    updateWorkExperience: async (payload: updateWorkExperience[]) => {
        for (const exp of payload) {
            const existingExp = await prisma.experience.findUnique({
                where: {
                    id: exp.id
                }
            });

            if (!existingExp) {
                throw new ApiError(httpStatus.NOT_FOUND, `Experience with id ${exp.id} not found!`);
            }

            await prisma.experience.update({
                where: {
                    id: exp.id,
                },
                data: {
                    workingRole: exp.workingRole,
                    companyName: exp.companyName,
                    description: exp.description,
                    endDate: exp.endDate,
                    startDate: exp.startDate
                }
            })
        }
        return { message: "Work experiences updated successfully!" }
    },
    updateEducation: async (payload: updateEducation[]) => {
        for (const edu of payload) {
            const existingEdu = await prisma.education.findUnique({
                where: {
                    id: edu.id
                }
            });

            if (!existingEdu) {
                throw new ApiError(httpStatus.NOT_FOUND, `Education with id ${edu.id} not found!`);
            }

            await prisma.education.update({
                where: {
                    id: edu.id,
                },
                data: {
                    degreeName: edu.degreeName,
                    instituteName: edu.instituteName,
                    endDate: edu.endDate,
                    startDate: edu.startDate
                }
            })
        }
        return { message: "Education updated successfully!" }
    },
    addResumeSkill: async (skill: Skill) => {
        if (!skill.resumeId) {
            throw new ApiError(httpStatus.NOT_FOUND, "Skill id is required!")
        }
        const resume = await prisma.resume.findUnique({
            where: {
                id: skill.resumeId
            }
        });

        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not Found!")
        }
        const result = await prisma.skill.create({
            data: {
                skillName: skill.skillName,
                skillCategory: skill.skillCategory,
                proficiencyLevel: skill.proficiencyLevel,
                yearOfExperience: skill.yearOfExperience,
                source: skill.source
            }
        })
        return result
    },
    updateResumeSkills: async (payload: Partial<Skill>[]) => {
        for (const skill of payload) {
            const existingSkills = await prisma.skill.findUnique({
                where: {
                    id: skill.id
                }
            });

            if (!existingSkills) {
                throw new ApiError(httpStatus.NOT_FOUND, `Skill with id ${skill.id} not found!`);
            }

            await prisma.skill.update({
                where: {
                    id: skill.id,
                },
                data: {
                    skillName: skill.skillName,
                    skillCategory: skill.skillCategory,
                    proficiencyLevel: skill.proficiencyLevel,
                    yearOfExperience: skill.yearOfExperience,
                    source: skill.source

                }
            })
        }
        return { message: "Skills updated successfully!" }
    },
    // ===== NEW FUNCTIONS FOR 4 NEW MODELS =====

    // --- PROJECTS ---
    addProject: async (payload: Project) => {
        const resume = await prisma.resume.findUnique({ where: { id: payload.resumeId } });
        if (!resume) throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        return await prisma.project.create({
            data: { resumeId: payload.resumeId, name: payload.name, link: payload.link, techStack: payload.techStack, description: payload.description, startDate: payload.startDate, endDate: payload.endDate }
        });
    },

    updateProject: async (payload: Partial<Project>[]) => {
        for (const project of payload) {
            if (!project.id) throw new ApiError(httpStatus.BAD_REQUEST, "Project id is required!");
            const existing = await prisma.project.findUnique({ where: { id: project.id } });
            if (!existing) throw new ApiError(httpStatus.NOT_FOUND, `Project with id ${project.id} not found!`);
            await prisma.project.update({
                where: { id: project.id },
                data: { name: project.name, link: project.link, techStack: project.techStack, description: project.description, startDate: project.startDate, endDate: project.endDate }
            });
        }
        return { message: "Projects updated successfully!" };
    },

    deleteProject: async (projectId: string) => {
        const existing = await prisma.project.findUnique({ where: { id: projectId } });
        if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Project not found!");
        await prisma.project.delete({ where: { id: projectId } });
        return { message: "Project deleted successfully!" };
    },

    // --- OTHER LINKS ---
    addOtherLink: async (payload: OtherLink) => {
        const resume = await prisma.resume.findUnique({ where: { id: payload.resumeId } });
        if (!resume) throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        return await prisma.otherLink.create({
            data: { resumeId: payload.resumeId, type: payload.type, link: payload.link }
        });
    },

    updateOtherLink: async (payload: Partial<OtherLink>[]) => {
        for (const link of payload) {
            if (!link.id) throw new ApiError(httpStatus.BAD_REQUEST, "Link id is required!");
            const existing = await prisma.otherLink.findUnique({ where: { id: link.id } });
            if (!existing) throw new ApiError(httpStatus.NOT_FOUND, `Link with id ${link.id} not found!`);
            await prisma.otherLink.update({
                where: { id: link.id },
                data: { type: link.type, link: link.link }
            });
        }
        return { message: "Links updated successfully!" };
    },

    deleteOtherLink: async (linkId: string) => {
        const existing = await prisma.otherLink.findUnique({ where: { id: linkId } });
        if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Link not found!");
        await prisma.otherLink.delete({ where: { id: linkId } });
        return { message: "Link deleted successfully!" };
    },

    // --- LANGUAGES ---
    addLanguage: async (payload: Language) => {
        const resume = await prisma.resume.findUnique({ where: { id: payload.resumeId } });
        if (!resume) throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        return await prisma.language.create({
            data: { resumeId: payload.resumeId, name: payload.name }
        });
    },

    updateLanguage: async (payload: Partial<Language>[]) => {
        for (const lang of payload) {
            if (!lang.id) throw new ApiError(httpStatus.BAD_REQUEST, "Language id is required!");
            const existing = await prisma.language.findUnique({ where: { id: lang.id } });
            if (!existing) throw new ApiError(httpStatus.NOT_FOUND, `Language with id ${lang.id} not found!`);
            await prisma.language.update({
                where: { id: lang.id },
                data: { name: lang.name }
            });
        }
        return { message: "Languages updated successfully!" };
    },

    deleteLanguage: async (languageId: string) => {
        const existing = await prisma.language.findUnique({ where: { id: languageId } });
        if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Language not found!");
        await prisma.language.delete({ where: { id: languageId } });
        return { message: "Language deleted successfully!" };
    },

    // --- CERTIFICATES ---
    addCertificate: async (payload: Certificate) => {
        const resume = await prisma.resume.findUnique({ where: { id: payload.resumeId } });
        if (!resume) throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        return await prisma.certificate.create({
            data: { resumeId: payload.resumeId, name: payload.name, issueDate: payload.issueDate }
        });
    },

    updateCertificate: async (payload: Partial<Certificate>[]) => {
        for (const cert of payload) {
            if (!cert.id) throw new ApiError(httpStatus.BAD_REQUEST, "Certificate id is required!");
            const existing = await prisma.certificate.findUnique({ where: { id: cert.id } });
            if (!existing) throw new ApiError(httpStatus.NOT_FOUND, `Certificate with id ${cert.id} not found!`);
            await prisma.certificate.update({
                where: { id: cert.id },
                data: { name: cert.name, issueDate: cert.issueDate }
            });
        }
        return { message: "Certificates updated successfully!" };
    },

    deleteCertificate: async (certificateId: string) => {
        const existing = await prisma.certificate.findUnique({ where: { id: certificateId } });
        if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Certificate not found!");
        await prisma.certificate.delete({ where: { id: certificateId } });
        return { message: "Certificate deleted successfully!" };
    },

}