import status from "http-status";
import { getClarityPercentageChange, getClearityScore, hashPassword, parseResume } from "./user.helper";
import ApiError from "../../errors/ApiError";
import { SubscriptionType, User, UserRole } from "@prisma/client";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { createToken } from "../auth/auth.utils";
import config from "../../../config";
import stripe from "../../stripe/stripe";
import { addManagerInput } from "./user.validation";
import { monthlyRevenue } from "../subscription/subscription.helper";
import { SkillService } from "../skill/skill.service";
import httpStatus from "http-status";
import axios from "axios";
import { CreateResumeProfilePayload } from "../resumeProfile/resumeProfile.interface";
import { ResumeProfileService } from "../resumeProfile/resumeProfile.service";


export const UserService = {
  register: async (payload: User) => {
    const isUserExist = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (isUserExist) {
      throw new ApiError(status.BAD_REQUEST, "User already exists");
    }

    const hashedPassword = await hashPassword(payload.password ?? "");
    const user = await prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
        resumeLink: payload.resumeLink ?? null
      },
    });
    // if (payload.resumeLink) {
    //   const parsedResume = await parseResume(payload.resumeLink);

    //   const resumePayload: CreateResumeProfilePayload = {
    //     domain: parsedResume.domain,
    //     subdomain: parsedResume.subdomain,
    //     name: parsedResume.name,
    //     email: parsedResume.email,
    //     phone: parsedResume.phone,
    //     location: parsedResume.location,
    //     summary: parsedResume.summary,
    //     totalExp: parsedResume.totalExp,
    //     skills: parsedResume.skills,
    //     sections: parsedResume.sections.map((section: any) => ({
    //       sectionType: section.sectionType,
    //       title: section.title,
    //       orderIndex: section.orderIndex,
    //       items: section.items.map((item: any) => ({
    //         orderIndex: item.orderIndex,
    //         data: item.data,
    //       })),
    //     })),
    //   };

    //   await ResumeProfileService.create(user.id, resumePayload);

    //   return {
    //     accessToken: "test",
    //     refreshToken: "test",
    //     resumeLink: payload.resumeLink,
    //     parsedResume,
    //   };
    // }

    // Create Stripe customer and update user in one go
    try {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId: user.id }, // helpful for debugging in Stripe dashboard
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    } catch (err) {
      // User is created but Stripe failed — log it, don't break registration
      console.error("Stripe customer creation failed:", err);
    }

    const jwtPayload = {
      id: user.id,
      fullName: user.fullName ?? undefined,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt.access_secret as string,
      config.jwt.access_expires_in as string
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt.refresh_token_secret as string,
      config.jwt.refresh_token_expires_in as string
    );

    return { accessToken, refreshToken };
  },

  getAllUserFromDB: async (query: Record<string, unknown>) => {
    const userQuery = new QueryBuilder(prisma.user, query)
      .search(["fullName", "email"])
      .filter()
      .paginate()
      .select({
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        isBlocked: true,
        createdAt: true,
        lastLogin: true,
        subscriptionType: true
      })

    const [result, meta] = await Promise.all([
      userQuery.execute(),
      userQuery.countTotal(),
    ]);

    if (!result.length) {
      throw new ApiError(status.NOT_FOUND, "No users found!");
    }

    // Remove password from each user
    const data = result.map((user: User) => {
      const { password, ...rest } = user;
      return rest;
    });

    return {
      meta,
      data,
    };
  },
  myProfile: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        profession: true,
        role: true,
        bio: true,
        location: true,
        mentorProfile: true,
        careerStage: true,
        isOnboarded: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!")
    }
    return user;
  },

  updateProfile: async (userId: string, payload: Partial<User>) => {
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    if (!payload.profileImage) {
      payload.profileImage = isUserExist.profileImage;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: payload.fullName,
        profileImage: payload.profileImage || "",
        bio: payload.bio,
        location: payload.location,
        profession: payload.profession,
        marketingEmails: payload.marketingEmails,
        jobAlerts: payload.jobAlerts,
        emailNotification: payload.emailNotification,
        careerStage: payload.careerStage,
        isOnboarded: payload.isOnboarded,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        location: true,
        bio: true,
        role: true,
        marketingEmails: true,
        jobAlerts: true,
        emailNotification: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  },
  getSingleUserByIdFromDB: async (userId: string) => {
    const result = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        profession: true,
        profileImage: true,
        location: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!result) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    return result
  },
  deleteUserFromDB: async (userId: string) => {
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return null;
  },
  blockUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    if (user.role === UserRole.ADMIN) {
      throw new ApiError(status.NOT_FOUND, "Admin cannot be blocked!")
    }
    if (user?.isBlocked) {
      throw new ApiError(status.NOT_FOUND, "User is Already Blocked!");
    }
    const result = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });

    return result;
  },

  unblockUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    if (user.isBlocked === false) {
      throw new ApiError(status.NOT_ACCEPTABLE, "User already unblocked!")
    }
    const result = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false },
    });

    return result;
  },
  addManager: async (payload: addManagerInput) => {
    const isUserExist = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (isUserExist) {
      throw new ApiError(status.BAD_REQUEST, "User already exists");
    }

    const hashedPassword = await hashPassword(payload.password ?? "");

    const result = await prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
        role: UserRole.MANAGER
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        isManagerAllowed: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Create Stripe customer and update user in one go
    try {
      const stripeCustomer = await stripe.customers.create({
        email: result.email,
        name: result.fullName,
        metadata: { userId: result.id }, // helpful for debugging in Stripe dashboard
      });

      await prisma.user.update({
        where: { id: result.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    } catch (err) {
      // User is created but Stripe failed — log it, don't break registration
      console.error("Stripe customer creation failed:", err);
    }

    return result
  },
  getAllAdmins: async (query: Record<string, unknown>) => {
    const userQuery = new QueryBuilder(prisma.user, query)
      .search(["fullName", "email"])
      .filter()
      .rawFilter({ role: { in: [UserRole.ADMIN, UserRole.MANAGER] } })
      .paginate()
      .select({
        id: true,
        fullName: true,
        email: true,
        role: true,
        profileImage: true,
        isBlocked: true,
        createdAt: true,
        lastLogin: true,
        subscriptionType: true
      })

    const [result, meta] = await Promise.all([
      userQuery.execute(),
      userQuery.countTotal(),
    ]);

    if (!result.length) {
      throw new ApiError(status.NOT_FOUND, "No users found!");
    }
    return {
      meta,
      data: result,
    };
  },
  adminDashboardOverview: async () => {
    const totalUser = await prisma.user.count();
    const activeUser = await prisma.user.count({
      where: {
        isBlocked: false
      }
    });
    const totalGigs = await prisma.gig.count();
    const totalRevenue = await monthlyRevenue();
    const freeUser = await prisma.user.count({
      where: {
        subscriptionType: SubscriptionType.FREE
      }
    });
    const proUser = await prisma.user.count({
      where: {
        subscriptionType: {
          in: [SubscriptionType.PRO, SubscriptionType.PREMIUM]
        }
      }
    });
    const recentUser = await prisma.user.findMany({
      where: {
        isBlocked: false
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        isBlocked: true,
        subscriptionType: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    });

    const topSkills = await SkillService.topSkills();
    return {
      totalUser,
      activeUser,
      totalGigs,
      topSkills,
      monthlyRevenue: totalRevenue,
      freeUser: (freeUser / totalUser) * 100,
      proUser: (proUser / totalUser) * 100,
      recentUser
    }
  },
  userDashboardOverview: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Fetch similar gigs safely — don't crash dashboard if AI service fails
    const fetchSimilarGigs = async () => {
      try {
        const response = await axios.get(
          `${config.ai_base_url}/v1/gigs/similar`,
          {
            params: { user_id: userId, page: 1, page_size: 3 },
            headers: { accept: "application/json" },
          }
        );
        return response.data.gigs ?? [];
      } catch (err: any) {
        console.warn("Failed to fetch similar gigs:", err?.response?.status, err?.message);
        return [];
      }
    };

    const [skills, skillAddedThisMonth, opportunityMatches] = await Promise.all([
      prisma.skill.findMany({
        where: { userId },
        select: { skillName: true },
      }),

      prisma.skill.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      }),

      fetchSimilarGigs(),
    ]);

    const [activityLog, clarity] = await Promise.all([
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      getClearityScore(userId),
    ]);

    return {
      topSkills: skills,
      opportunityMatches,
      monthlyInsights: {
        skillsAddedThisMonth: skillAddedThisMonth,
        clarity: clarity.currentMonth.score,
        activityLog,
      },
    };
  },
  monthlyInsight: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    // 🗓 Get start & end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const skillCount = await prisma.skill.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      }
    });

    const userSkills = await prisma.skill.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      },
      select: {
        skillName: true
      },
      take: 3
    });

    const topThreeSkills = userSkills;

    const skillImpactDetails = await Promise.all(
      topThreeSkills.map(async (skill) => {
        const response = await axios.post(
          `${config.ai_base_url}/v1/skill-impact`,
          null,
          {
            params: {
              skill: skill.skillName,
            },
            headers: {
              accept: "application/json",
            },
          }
        );

        return {
          skill: skill.skillName,
          impact: response.data,
        };
      })
    );

    const clarity = await getClearityScore(userId);
    const delta = getClarityPercentageChange(clarity)

    return {
      clarityScore: clarity.currentMonth.score,
      delta,
      skillCount,
      newRoleIdentified: clarity.matched_gigs_this_month,
      skillImpactDetails
    }
  }
};
