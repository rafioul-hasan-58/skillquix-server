export const QUEUE_NAMES = {
    RESUME: "resume",
    EMAIL: "email",
    EMBEDDING: "embedding",
    MASTER_CV: "master-cv",
};

export const JOB_NAMES = {
    RESUME: {
        EXTRACT_AND_SAVE: "extract-and-save",
        EXTRACT_AND_EMBED: "extract-and-embed",
    },
    EMAIL: {
        WELCOME: "welcome",
        OTP: "otp",
        NOTIFICATION: "notification",
    },
    EMBEDDING: {
        GIG: "gig-embedding",
        MENTOR: "mentor-embedding",
        USER: "user-embedding",
    },
    MASTER_CV: {
        ENHANCE_CHALLENGE: "enhance-challenge",
    }
};