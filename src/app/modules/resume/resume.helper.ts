import axios from "axios";
import { createResume } from "./resume.interface";
import { Education, Experience, Skill } from "@prisma/client";
import config from "../../../config";

export const generateResumeEmbedding = async (payload: createResume) => {
    const {
        name,
        title,
        email,
        location,
        phone,
        summary,
        experiences,
        education,
        skills,
    } = payload;

    // 🔹 Build Structured Resume Text
    const resumeText = `
Name: ${name}
Title: ${title}
Email: ${email}
Phone: ${phone}
Location: ${location}

Summary:
${summary || "N/A"}

Experience:
${experiences?.map((exp: Experience, index: number) => `
${index + 1}. ${exp.workingRole} at ${exp.companyName}
Duration: ${exp.startDate} - ${exp.endDate || "Present"}
Description: ${exp.description}
`).join("\n") || "N/A"}

Education:
${education?.map((edu: Education, index: number) => `
${index + 1}. ${edu.degreeName} - ${edu.instituteName}
Duration: ${edu.startDate} - ${edu.endDate}
`).join("\n") || "N/A"}

Skills:
${skills?.map((skill: Skill, index: number) =>
        `${index + 1}. ${skill.skillName} | ${skill.proficiencyLevel} | ${skill.yearOfExperience} years`
    ).join("\n") || "N/A"}
`.trim();

    try {
        // 🔹 Call Embedding API
        const response = await axios.post(
            `${config.ai_base_url}/v1/get-embedding`,
            {},
            {
                params: {
                    text: resumeText,
                },
                headers: {
                    accept: "application/json",
                },
            }
        );

        return response.data

    } catch (error: any) {
        return {
            success: false,
            message: "Failed to generate embedding",
            error: error?.response?.data || error.message,
        };
    }
};