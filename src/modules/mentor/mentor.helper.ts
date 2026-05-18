
import { aiClient } from "../../infrastructure/ai/aiClient";
import { AI_ENDPOINTS } from "../../infrastructure/ai/aiEndpoints";



export const generateMentorshipEmbedding = async (
  mentorshipDetails: string,
  skills: string[]
) => {
  // Build structured text for embedding
  const mentorshipText = `
${mentorshipDetails}

Skills:
${skills.map((skill, i) => `${i + 1}. ${skill}`).join("\n")}
`.trim();
  const { data } = await aiClient.post<number[]>(
    AI_ENDPOINTS.MENTOR.GET_EMBEDDING,
    {},
    { params: { text: mentorshipText } }
  )

  return data
};


export const upsertMentorEmbedding = async (mentorId: string, embedding: number[]) => {
  const { data } = await aiClient.post<number[]>(
    AI_ENDPOINTS.MENTOR.UPSERT_EMBEDDING,
    { embedding },
    {
      params: {
        mentor_id: mentorId
      }
    }
  )
  return data
};
