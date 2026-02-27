import axios from "axios";
import config from "../../../config";

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

export const generateGigEmbedding = async (payload: GigPayload) => {
    const {
        industryName,
        industryEmail,
        gigTitle,
        category,
        source,
        description,
        gigType,
        experienceLevel,
        duration,
        location,
        jobDescription,
        responsibilities,
        benefits,
        gigStatus,
        validUntil,
    } = payload;

    // 🧠 Build structured text for embedding
    const gigText = `
Industry: ${industryName}
Email: ${industryEmail}
Title: ${gigTitle}
Category: ${category}
Source: ${source}
Type: ${gigType}
Experience Level: ${experienceLevel}
Duration: ${duration}
Location: ${location}
Status: ${gigStatus}
Valid Until: ${validUntil}

Short Description:
${description}

Job Description:
${jobDescription?.map((res, i) => `${i + 1}. ${res}`).join("\n")}

Responsibilities:
${responsibilities?.map((res, i) => `${i + 1}. ${res}`).join("\n")}

Benefits:
${benefits?.map((ben, i) => `${i + 1}. ${ben}`).join("\n")}
  `.trim();
    // 📡 Call embedding API
    try {
        // 🔹 Call Embedding API
        const response = await axios.post(
            `${config.ai_base_url}/v1/get-embedding`,
            {},
            {
                params: {
                    text: gigText,
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


export const upsertGigEmbedding = async (
    gigId: string,
    embedding: number[]
) => {
    try {
        const response = await axios.post(
            `${config.ai_base_url}/v1/upsert_gig_embedding`,
            {
                embedding,
            },
            {
                params: {
                    gig_id: gigId, // query param
                },
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                timeout: 10000, // optional (10s timeout)
            }
        );

        return response.data;
    } catch (error: any) {
        console.error("Upsert Gig Embedding Error:", error?.response?.data || error.message);
        throw new Error("Failed to upsert gig embedding");
    }
};