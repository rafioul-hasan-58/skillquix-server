
import { aiClient } from "../../infrastructure/ai/aiClient";
import { AI_ENDPOINTS } from "../../infrastructure/ai/aiEndpoints";

interface GigPayload {
    industryName: string;
    industryEmail: string;
    gigTitle: string;
    category: string;
    source: string;
    description: string;
    gigType: string;
    experienceLevel: string;
    duration: string;
    location: string;
    jobDescription: string[];
    responsibilities: string[];
    benefits: string[];
    gigStatus: string;
    validUntil: string;
}

// Build structured text for embedding
const buildGigText = (payload: GigPayload): string => {
    const list = (items: string[]) =>
        items?.map((item, i) => `${i + 1}. ${item}`).join("\n") ?? "";

    return `
Industry: ${payload.industryName}
Email: ${payload.industryEmail}
Title: ${payload.gigTitle}
Category: ${payload.category}
Source: ${payload.source}
Type: ${payload.gigType}
Experience Level: ${payload.experienceLevel}
Duration: ${payload.duration}
Location: ${payload.location}
Status: ${payload.gigStatus}
Valid Until: ${payload.validUntil}

Short Description:
${payload.description}

Job Description:
${list(payload.jobDescription)}

Responsibilities:
${list(payload.responsibilities)}

Benefits:
${list(payload.benefits)}
  `.trim();
};

export const generateGigEmbedding = async (
    payload: GigPayload
): Promise<number[]> => {
    const text = buildGigText(payload);

    const { data } = await aiClient.post<number[]>(
        AI_ENDPOINTS.GIG.GET_EMBEDDING,
        {},
        { params: { text } }
    );

    return data
};

export const upsertGigEmbedding = async (gigId: string, embedding: number[]) => {
    const { data } = await aiClient.post<string>(
        AI_ENDPOINTS.GIG.UPSERT_EMBEDDING,
        { embedding },
        {
            params: {
                gig_id: gigId
            }
        }
    )
    return data
};

export const fetchSkillGap = async (userId: string, gigId: string) => {
    const { data } = await aiClient.get(
        AI_ENDPOINTS.SKILL.USER_SKILLGAP,
        {
            params: {
                user_id: userId,
                gig_id: gigId
            }
        })
    return data
}
export const fetchSimilarGigs = async (userId: string) => {
    const { data } = await aiClient.get(
        AI_ENDPOINTS.GIG.FETCH_SIMILAR_GIGS,
        {
            params: {
                user_id: userId,
                page: 1,
                page_size: 3
            }
        })
    return data
}

export const getMatchScore = async (userId: string, gigId: string) => {
    const { data } = await aiClient.get(
        AI_ENDPOINTS.SKILL.GET_MATCH_SCORE,
        {
            params: {
                user_id: userId,
                gig_id: gigId
            }
        })
    return data
}
export const deleteGigFromAi = async (gigId: string) => {
    const { data } = await aiClient.delete(
        AI_ENDPOINTS.GIG.DELETE_GIG_FROM_AI(gigId)
    );
    return data
}
