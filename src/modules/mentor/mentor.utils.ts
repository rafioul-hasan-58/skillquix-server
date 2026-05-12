import axios from "axios";
import config from "../../config";

export const generateMentorshipEmbedding = async (
  mentorshipDetails: string,
  skills: string[]
) => {
  // 🧠 Build structured text for embedding
  const mentorshipText = `
${mentorshipDetails}

Skills:
${skills.map((skill, i) => `${i + 1}. ${skill}`).join("\n")}
`.trim();

  // 📡 Call embedding API
  try {
    const response = await axios.post(
      `${config.ai_base_url}/v1/get-embedding`,
      {}, // ✅ empty body
      {
        params: { text: mentorshipText }, // ✅ send text as query param
        headers: { accept: "application/json" },
      }
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to generate mentorship embedding",
      error: error?.response?.data || error.message,
    };
  }
};
export const upsertMentorEmbedding = async (mentorId: string, embedding: number[]) => {
  const url = `${config.ai_base_url}/v1/upsert_mentor_embedding?mentor_id=${mentorId}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ embedding })
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();

  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: "Failed to upseart mentorship embedding",
      error: error?.response?.data || error.message,
    };
  }
};
