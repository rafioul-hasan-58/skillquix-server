import { CreateResumeProfilePayload } from "./resumeProfile.interface";
import { aiClient } from "../../infrastructure/ai/aiClient";
import { AI_ENDPOINTS } from "../../infrastructure/ai/aiEndpoints";



const buildResumeText = (payload: CreateResumeProfilePayload) => {
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

    return resumeText
}

export const generateResumeProfileEmbedding = async (payload: CreateResumeProfilePayload) => {
    const resumeText = buildResumeText(payload);
    const { data } = await aiClient.post<number[]>(
        AI_ENDPOINTS.RESUME.GET_EMBEDDING,
        {},
        { params: { text: resumeText } }
    );
    return data;
}

export const upsertResumeEmbedding = async (
    userId: string,
    embedding: number[]
) => {
    const { data } = await aiClient.post<string>(
        AI_ENDPOINTS.RESUME.UPSERT_EMBEDDING,
        { embedding },
        {
            params: {
                user_id: userId,
            },
        }
    )
    return data
}