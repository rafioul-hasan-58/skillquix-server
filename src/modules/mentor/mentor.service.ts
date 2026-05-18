import { AdminApprovalStatus, MentorProfile, MentorshipCompletionStatus, MentorshipRequest, MentorshipRequestStatus, SessionStatus, SubscriptionType } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../app/errors/ApiError";
import httpStatus from "http-status";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import QueryBuilder from "../../infrastructure/builder/QueryBuilder";
import { generateMentorshipEmbedding, upsertMentorEmbedding } from "./mentor.helper";

// mentor
const setupMentorProfile = async (userId: string, payload: MentorProfile) => {
    // Combine user check + mentor profile creation in one transaction
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found to setup mentor profile!");
        }
        if (user.subscriptionType !== SubscriptionType.PREMIUM) {
            throw new ApiError(httpStatus.NOT_FOUND, "You need to have a premium subscription to setup a mentor profile!")
        }

        // Generate embedding outside the DB ops but inside transaction for atomicity
        const embedding = await generateMentorshipEmbedding(
            payload.mentorshipDetails,
            payload.skills
        );
        
        // Create profile with embedding in a single DB write instead of create + update
        const mentor = await tx.mentorProfile.create({
            data: { ...payload, userId, embedding },
        }).catch((err) => {
            if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
                throw new ApiError(httpStatus.CONFLICT, "A mentor profile already exists for this user.");
            }
            throw err;
        });

        // Upsert to vector store — if this fails, transaction rolls back the DB write
        return await upsertMentorEmbedding(mentor.id, embedding);
    });
};

const getMentorProfile = async (userId: string) => {
    const mentor = await prisma.mentorProfile.findUnique({
        where: {
            userId
        }
    });
    const recentApplications = await prisma.mentorshipRequest.findMany({
        where: {
            mentorId: mentor?.userId
        }
    });
    return {
        ...mentor,
        recentApplications
    }
};

// admin
const getMentorById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
    }
    const mentor = await prisma.mentorProfile.findUnique({
        where: {
            userId: user.id
        },
        select: {
            id: true,
            userId: true,
            mentorshipDetails: true,
            skills: true,
            availability: true,
            isActive: true,
            isApproved: true,
            adminApprovalStatus: true,
            lastMentorAction: true,
            user: {
                select: {
                    id: true,
                    profileImage: true,
                    fullName: true,
                    email: true,
                    isBlocked: true,
                    subscriptionType: true,
                }
            }
        }
    });
    return mentor
};

// mentor
const updateMentorProfile = async (userId: string, payload: Partial<MentorProfile>) => {
    const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId } });
    if (!mentorProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile not found!");
    }
    // Step 2: Update mentor profile
    const updated = await prisma.mentorProfile.update({
        where: { userId },
        data: {
            ...payload,
        },
    });

    return updated;

};

// mentor
const getMyRequests = async (mentorId: string, query: Record<string, unknown>) => {
    const mentor = await prisma.user.findUnique({
        where: {
            id: mentorId
        },
        include: {
            mentorProfile: true
        }
    });
    console.log("mentorId", mentorId)

    if (!mentor) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
    }
    if (!mentor?.mentorProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, "No mentor found!setup your mentor profile first!")
    };

    // update last mentor action
    await prisma.mentorProfile.update({
        where: { userId: mentorId },
        data: { lastMentorAction: new Date() }
    });
    const userQuery = new QueryBuilder(prisma.mentorshipRequest, query)
        .filter()
        .search(["mentee.fullName", "mentee.profession"])
        .rawFilter({ mentorId })
        .paginate()
        .select({
            id: true,
            learningGoals: true,
            actionItems: true,
            status: true,
            mentee: {
                select: {
                    id: true,
                    fullName: true,
                    profession: true,
                    profileImage: true
                }
            }
        })

    const [data, meta] = await Promise.all([
        userQuery.execute(),
        userQuery.countTotal(),
    ]);
    return {
        data,
        meta
    }
};

// mentor
const requestDetails = async (requestId: string, userId: string, query: Record<string, unknown>) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            mentorProfile: true
        }
    });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!")
    }
    const result = await prisma.mentorshipRequest.findUnique({
        where: {
            id: requestId,
        },
        select: {
            id: true,
            status: true,
            learningGoals: true,
            actionItems: true,
            mentee: {
                select: {
                    id: true,
                    fullName: true,
                    profession: true,
                    profileImage: true,
                },
            },
            mentor: {
                select: {
                    id: true,
                    fullName: true,
                    profession: true,
                    profileImage: true,
                    mentorProfile: {
                        select: {
                            skills: true
                        }
                    }
                }
            },
            mentorshipCompletion: true

        },
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentorship request not found!");
    }

    const mentorshipsessionsQuery = new QueryBuilder(prisma.mentorshipSession, query)
        .filter()
        .rawFilter({ requestId })
        .select({
            id: true,
            topic: true,
            meetLink: true,
            mentorNotes: true,
            startDateTime: true,
            endDateTime: true,
            status: true,
            declineReason: true,
            menteeRequestNote: true,

        })

    const [mentorshipSessions] = await Promise.all([
        mentorshipsessionsQuery.execute(),
    ]);


    return {
        ...result,
        mentorshipSessions
    }
};

// mentor
const acceptMentorshipRequest = async (requestId: string) => {
    const request = await prisma.mentorshipRequest.findUnique({
        where: {
            id: requestId
        }
    });
    if (!request) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentorship request Not found!")
    }
    const result = await prisma.mentorshipRequest.update({
        where: {
            id: requestId
        },
        data: {
            status: MentorshipRequestStatus.ACCEPTED
        }
    });

    // update last response to request
    await prisma.mentorProfile.update({
        where: { userId: request.mentorId },
        data: { lastResponseToRequest: new Date() }
    });

    return {
        message: "Request accepted!"
    }
};

// mentor
const rejectMentorshipRequest = async (requestId: string) => {
    const request = await prisma.mentorshipRequest.findUnique({
        where: {
            id: requestId
        }
    });
    if (!request) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentorship request Not found!")
    }
    await prisma.mentorshipRequest.update({
        where: {
            id: requestId
        },
        data: {
            status: MentorshipRequestStatus.REJECTED
        }
    });

    // update last response to request
    await prisma.mentorProfile.update({
        where: { userId: request.mentorId },
        data: { lastResponseToRequest: new Date() }
    });

    return {
        message: "Request rejected!"
    }
};

// mentee
const sendMentorshipRequest = async (menteeId: string, payload: MentorshipRequest) => {
    if (menteeId === payload.mentorId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "You can't send mentorship request to yourself!")
    }
    const mentee = await prisma.user.findUnique({
        where: {
            id: menteeId
        }
    });
    if (!mentee) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentee not found to send mentorship request!");
    };
    const mentor = await prisma.user.findUnique({
        where: {
            id: payload.mentorId
        },
        include: {
            mentorProfile: true
        }
    });
    if (!mentor?.mentorProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Provide a valid mentor!")
    }
    const result = await prisma.mentorshipRequest.create({
        data: {
            menteeId,
            mentorId: payload.mentorId,
            matchPercentage: payload.matchPercentage,
            actionItems: payload.actionItems,
            learningGoals: payload.learningGoals
        }
    });
    return result
};

// mentee
const myMentors = async (menteeId: string, query: Record<string, unknown>) => {
    const mentee = await prisma.user.findUnique({
        where: {
            id: menteeId
        }
    });
    if (!mentee) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentee not found!")
    };
    const userQuery = new QueryBuilder(prisma.mentorshipRequest, query)
        .search(["mentor.mentorProfile.mentorName", "mentor.mentorProfile.role"])
        .filter()
        .rawFilter({ menteeId })
        .paginate()
        .select({
            id: true,
            status: true,
            matchPercentage: true,
            mentor: {
                select: {
                    id: true,
                    profileImage: true,
                    mentorProfile: {
                        select: {
                            id: true,
                            mentorName: true,
                            role: true,
                            skills: true,
                        }
                    }
                }
            }
        })

    const [result, meta] = await Promise.all([
        userQuery.execute(),
        userQuery.countTotal(),
    ]);
    return {
        data: result,
        meta
    }
};

// admin
const getMentors = async (query: Record<string, unknown>) => {
    if (query.isApproved) {
        if (query.isApproved === "true") {
            query.isApproved = true
        }
        else {
            query.isApproved = false
        }
    }
    const userQuery = new QueryBuilder(prisma.mentorProfile, query)
        .search(["user.fullName", "user.email", "mentorName"])
        .filter()
        .paginate()
        .select({
            id: true,
            mentorName: true,
            role: true,
            company: true,
            experienceYears: true,
            isApproved: true,
            adminApprovalStatus: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    profileImage: true,
                    fullName: true,
                    email: true,
                    isBlocked: true,
                    subscriptionType: true,
                }
            }
        })

    const [result, meta] = await Promise.all([
        userQuery.execute(),
        userQuery.countTotal(),
    ]);
    return {
        data: result,
        meta
    }
};

// admin
const approveMentor = async (mentorId: string) => {
    const mentor = await prisma.mentorProfile.findUnique({
        where: {
            id: mentorId
        },
    });
    if (!mentor) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile is not setted up yet!");
    };

    if (mentor.isApproved) {
        throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Mentor already approved!")
    }

    await prisma.mentorProfile.update({
        where: {
            id: mentorId
        },
        data: {
            isApproved: true,
            adminApprovalStatus: AdminApprovalStatus.APPROVED
        }
    });

    return {
        message: "Mentor approved successfully!"
    }
};

// admin
const rejectMentor = async (mentorId: string) => {
    const mentor = await prisma.mentorProfile.findUnique({
        where: {
            id: mentorId
        },
    });
    if (!mentor) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile is not setted up yet!");
    };

    await prisma.mentorProfile.update({
        where: {
            id: mentorId
        },
        data: {
            isApproved: false,
            adminApprovalStatus: AdminApprovalStatus.REJECTED
        }
    });

    return {
        message: "Mentor rejected successfully!"
    }
};

// mentor
const activateMentorProfile = async (userId: string) => {
    const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId } });
    if (!mentorProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile not found!");
    }
    if (mentorProfile.isActive) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Mentor profile is already active!");
    }
    await prisma.mentorProfile.update({
        where: { userId },
        data: { isActive: true },
    });
    return {
        message: "Profile activated!"
    }
};

const deactivateMentorProfile = async (userId: string) => {
    const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId } });
    if (!mentorProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile not found!");
    }
    if (!mentorProfile.isActive) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Mentor profile is already inactive!");
    }

    await prisma.mentorProfile.update({
        where: { userId },
        data: { isActive: false },
    });
    return {
        message: "Profile deactivated!"
    }
};

// mentee
// acceptMentorshipCompletion: async (payload: { completionId: string, actionItems: string[] }) => {
//     const { completionId, actionItems } = payload;
//     const completion = await prisma.mentorshipCompletion.findUnique({
//         where: {
//             id: completionId
//         }
//     });
//     if (!completion) {
//         throw new ApiError(httpStatus.NOT_FOUND, "Completion request not found!")
//     }
//     const result = await prisma.mentorshipCompletion.update({
//         where: {
//             id: completionId
//         },
//         data: {
//             actionItems: actionItems,
//             status: MentorshipCompletionStatus.ACCEPTED
//         }
//     });
//     // update request status
//     await prisma.mentorshipRequest.update({
//         where: {
//             id: completion.requestId
//         },
//         data: {
//             status: MentorshipRequestStatus.COMPLETED
//         }
//     });
//     // update all sessions
//     await prisma.mentorshipSession.updateMany({
//         where: {
//             requestId: completion.requestId
//         },
//         data: {
//             status: SessionStatus.COMPLETED
//         }
//     });

//     // update last response to request (mentor action)
//     const request = await prisma.mentorshipRequest.findUnique({
//         where: { id: completion.requestId }
//     });
//     if (request) {
// await prisma.mentorProfile.update({
//     where: { userId: request.mentorId },
//     data: { lastResponseToRequest: new Date() }
// });
//     }

//     return result
// },

// mentee
const sendMentorshipCompletion = async (payload: { requestId: string, actionItems: string[] }) => {
    const { requestId, actionItems } = payload;

    const request = await prisma.mentorshipRequest.findUnique({
        where: { id: requestId }
    });
    if (!request) {
        throw new ApiError(httpStatus.NOT_FOUND, "Request not found!");
    }

    // Check if completion already exists
    const existingCompletion = await prisma.mentorshipCompletion.findUnique({
        where: { requestId }
    });
    if (existingCompletion) {
        throw new ApiError(httpStatus.CONFLICT, "Mentorship completion already submitted for this request!");
    }
    // at least one session should complete
    const hasOneSessionCompleted = await prisma.mentorshipSession.count({
        where: {
            requestId,
            status: SessionStatus.COMPLETED
        }
    }) > 0;

    if (!hasOneSessionCompleted) {
        throw new ApiError(httpStatus.BAD_REQUEST, "At least one session should complete!");
    }

    const result = await prisma.mentorshipCompletion.create({
        data: {
            requestId,
            actionItems,
            status: MentorshipCompletionStatus.PENDING
        }
    });
    return result;
};

// mentor
const acceptMentorshipCompletion = async (userId: string, payload: {
    completionId: string;
    actionItems: string[];
}) => {
    const { completionId, actionItems } = payload;

    // Single upfront read — also validates existence
    const completion = await prisma.mentorshipCompletion.findUnique({
        where: { id: completionId },
        select: { requestId: true }, // only pull what we need
    });
    if (!completion) {
        throw new ApiError(httpStatus.NOT_FOUND, "Completion request not found!");
    }

    // One transaction — atomic, and mentorId comes from the nested read
    // so we never hit the DB twice for the same request row.
    const [result] = await prisma.$transaction([
        // 1 & 2 — run completion update + request update in parallel
        prisma.mentorshipCompletion.update({
            where: { id: completionId },
            data: {
                actionItems,
                status: MentorshipCompletionStatus.ACCEPTED,
            },
        }),
        prisma.mentorshipRequest.update({
            where: { id: completion.requestId },
            data: { status: MentorshipRequestStatus.COMPLETED },
        }),
        // 3 — sessions
        prisma.mentorshipSession.updateMany({
            where: { requestId: completion.requestId },
            data: { status: SessionStatus.COMPLETED },
        }),
        // 4 — mentor profile timestamp, fetching mentorId inline via nested where
        prisma.mentorProfile.update({
            where: { userId },
            data: { lastResponseToRequest: new Date() }
        })
    ]);

    return result;
};

// mentor
const rejectMentorshipCompletion = async (completionId: string, feedback: string) => {
    const completion = await prisma.mentorshipCompletion.findUnique({
        where: {
            id: completionId
        }
    });
    if (!completion) {
        throw new ApiError(httpStatus.NOT_FOUND, "Completion request not found!")
    }
    const result = await prisma.mentorshipCompletion.update({
        where: {
            id: completionId
        },
        data: {
            status: MentorshipCompletionStatus.REJECTED,

        }
    });

    // update last response to request (mentor action)
    const request = await prisma.mentorshipRequest.findUnique({
        where: { id: completion.requestId }
    });
    if (request) {
        await prisma.mentorProfile.update({
            where: { userId: request.mentorId },
            data: { lastResponseToRequest: new Date() }
        });
    }

    return result
};

export const MentorService = {
    setupMentorProfile,
    getMentorProfile,
    getMentorById,
    updateMentorProfile,
    getMyRequests,
    requestDetails,
    acceptMentorshipRequest,
    rejectMentorshipRequest,
    sendMentorshipRequest,
    myMentors,
    getMentors,
    approveMentor,
    rejectMentor,
    activateMentorProfile,
    deactivateMentorProfile,
    sendMentorshipCompletion,
    acceptMentorshipCompletion,
    rejectMentorshipCompletion,
}