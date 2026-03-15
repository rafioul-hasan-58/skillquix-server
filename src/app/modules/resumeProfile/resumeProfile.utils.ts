import axios from "axios";
import { CreateResumeProfilePayload } from "./resumeProfile.interface";
import config from "../../../config";

export const generateResumeProfileEmbedding = async (payload: CreateResumeProfilePayload) => {
    const {
        location,
        summary,
        totalExp,
        domain,
        subdomain,
        sections,
        skills,
    } = payload;

    // 🔹 Build Structured Resume Text
    const resumeText = `
Location: ${location || "N/A"}
Domain: ${domain}
Subdomain: ${subdomain}
Total Experience: ${totalExp !== undefined ? `${totalExp} years` : "N/A"}

Summary:
${summary || "N/A"}

${sections?.map((section) => `
${section.title}:
${section.items
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((item, index) => {
        const fields = Object.entries(item.data)
            .map(([key, value]) => `  ${key}: ${value ?? "N/A"}`)
            .join("\n");
        return `${index + 1}.\n${fields}`;
    })
    .join("\n")}
`).join("\n") || "N/A"}

Skills:
${skills?.map((skillGroup, index) =>
    `${index + 1}. ${skillGroup.category}: ${skillGroup.Skills.join(", ")}`
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

        return response.data;

    } catch (error: any) {
        return {
            success: false,
            message: "Failed to generate embedding",
            error: error?.response?.data || error.message,
        };
    }
};