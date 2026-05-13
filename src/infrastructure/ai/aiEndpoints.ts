


export const AI_ENDPOINTS = {
    GIG: {
        GET_EMBEDDING: "/v1/get-embedding",
        UPSERT_EMBEDDING: "/v1/upsert_gig_embedding",
    },
    SKILL: {
        USER_SKILLGAP: "/v1/user_skillgap",
        GET_MATCH_SCORE: `/v1/get_match_scores`,
    },
    RESUME: {
        GET_EMBEDDING: "/v1/get-embedding",
        UPSERT_EMBEDDING: "/v1/upsert_resume_embedding",
    },
    MENTOR: {
        GET_EMBEDDING: "/v1/get-embedding",
        UPSERT_EMBEDDING: "/v1/upsert_mentor_embedding",
    },
    USER: {
        RESUME_PARSE: "/v1/resume-parse",
        CLEARITY_SCORE: (userId: string) => `/v1/clearity-score/${userId}`,
    }
}