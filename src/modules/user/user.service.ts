import status from "http-status";
import { getClarityPercentageChange, getClearityScore, hashPassword, parseResume } from "./user.helper";
import { SubscriptionType, User, UserRole } from "@prisma/client";
import prisma from "../../lib/prisma";
import { addManagerInput } from "./user.validation";
import { monthlyRevenue } from "../subscription/subscription.helper";
import { SkillService } from "../skill/skill.service";
import httpStatus from "http-status";
import axios from "axios";
import ApiError from "../../app/errors/ApiError";
import config from "../../config";
import QueryBuilder from "../../infrastructure/builder/QueryBuilder";
import stripe from "../../infrastructure/stripe/stripe";
import { fetchSimilarGigs } from "../gig/gig.helper";
import { JOB_NAMES } from "../../infrastructure/queue/queue.constant";
import { resumeExtractionQueue } from "../../infrastructure/queue/queues/resume.queue";
import { sendOTP } from "../../shared/utils/sendOTP";


const register = async (payload: User) => {
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
  if (payload.resumeLink) {
    await resumeExtractionQueue.add(
      JOB_NAMES.RESUME.EXTRACT_AND_SAVE,
      { userId: user.id, resumeUrl: payload.resumeLink },
      { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
    );
  }
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

  await prisma.masterCv.create({
    data: {
      userId: user.id,
      email: payload.email,
      fullName: payload.fullName
    }
  })

  // Send OTP to user's email for verification
  const otpResult = await sendOTP(user.id);

  return {
    message: "An OTP has been sent to your email. Please verify to complete registration.",
    expiresAt: otpResult.expiresAt,
  };
};

const getAllUserFromDB = async (query: Record<string, unknown>) => {
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
};

const myProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      profileImage: true,
      subscriptionStatus: true,
      subscriptionType: true,
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
};

const updateProfile = async (userId: string, payload: Partial<User>) => {
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
};

const getSingleUserByIdFromDB = async (userId: string) => {
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
};

const deleteUserFromDB = async (userId: string) => {
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
};

const blockUser = async (userId: string) => {
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
};

const unblockUser = async (userId: string) => {
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
};

const addManager = async (payload: addManagerInput) => {
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
};

const getAllAdmins = async (query: Record<string, unknown>) => {
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
};

const adminDashboardOverview = async () => {
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
};

const userDashboardOverview = async (userId: string) => {
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
  const fetchGigs = await fetchSimilarGigs(userId)

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

    fetchGigs,
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
};

const monthlyInsight = async (userId: string) => {
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
};

const PROFILE_FIELDS = [
  {
    field: "fullName",
    label: "Full Name",
    weight: 15,
    tip: "Add your full name",
    check: (user: any) => !!user.fullName && user.fullName.trim() !== "",
  },
  {
    field: "profileImage",
    label: "Profile Photo",
    weight: 10,
    tip: "Upload a profile photo to increase visibility",
    check: (user: any) => !!user.profileImage && user.profileImage.trim() !== "",
  },
  {
    field: "profession",
    label: "Profession",
    weight: 15,
    tip: "Add your profession or job title",
    check: (user: any) => !!user.profession && user.profession.trim() !== "",
  },
  {
    field: "location",
    label: "Location",
    weight: 10,
    tip: "Add your location",
    check: (user: any) => !!user.location && user.location.trim() !== "",
  },
  {
    field: "bio",
    label: "Bio",
    weight: 10,
    tip: "Write a short bio about yourself",
    check: (user: any) => !!user.bio && user.bio.trim() !== "",
  },
  {
    field: "experienceYear",
    label: "Experience Year",
    weight: 5,
    tip: "Add your years of experience",
    check: (user: any) => !!user.experienceYear && user.experienceYear.trim() !== "",
  },
  {
    field: "careerStage",
    label: "Career Stage",
    weight: 5,
    tip: "Select your career stage",
    check: (user: any) => !!user.careerStage && user.careerStage.trim() !== "",
  },
  {
    field: "resumeLink",
    label: "Resume",
    weight: 10,
    tip: "Upload your resume",
    check: (user: any) => !!user.resumeLink && user.resumeLink.trim() !== "",
  },
  {
    field: "skills",
    label: "Skills",
    weight: 10,
    tip: "Add at least one skill",
    check: (user: any) => user._count?.skills > 0,
  },
  {
    field: "resumeProfile",
    label: "Resume Profile",
    weight: 5,
    tip: "Parse your resume to create a resume profile",
    check: (user: any) => !!user.resumeProfile,
  },
  {
    field: "enhancedMasterCv",
    label: "Master CV",
    weight: 5,
    tip: "Complete your Master CV with work experiences",
    check: (user: any) => !!user.enhancedMasterCv && !!user.enhancedMasterCv.workExperiences,
  },
];

const getProfileStrength = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      resumeProfile: { select: { id: true } },
      enhancedMasterCv: { select: { id: true, workExperiences: true, aiScore: true, skills: true } },
      _count: { select: { skills: true, reflextions: true } },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }


  const completedFields: { field: string; label: string }[] = [];
  const missingFields: { field: string; label: string; tip: string }[] = [];
  let earnedWeight = 0;

  for (const entry of PROFILE_FIELDS) {
    if (entry.check(user)) {
      completedFields.push({ field: entry.field, label: entry.label });
      earnedWeight += entry.weight;
    } else {
      missingFields.push({ field: entry.field, label: entry.label, tip: entry.tip });
    }
  }

  const totalWeight = PROFILE_FIELDS.reduce((sum, f) => sum + f.weight, 0);
  const strengthPercentage = Math.round((earnedWeight / totalWeight) * 100);

  // Extract humanAuthenticityScore from enhancedMasterCv.aiScore.total
  const aiScore = user.enhancedMasterCv?.aiScore as Record<string, any> | null;
  const humanAuthenticityScore = aiScore?.total ?? null;

  // Extract top 3 skills by score from enhancedMasterCv.skills
  const rawSkills = (user.enhancedMasterCv?.skills as Array<{ skillName: string; score: number }>) ?? [];
  const topSkills = [...rawSkills]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)
    .map(({ skillName, score }) => ({ skillName, score }));

  // Badge based on reflextion count
  const reflextionCount = user._count.reflextions;
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const last14DaysReflextionCount = await prisma.reflextion.count({
    where: { userId, createdAt: { gte: fourteenDaysAgo } },
  });

  const BADGE_TIERS = [
    { min: 15, badge: "Visionary", description: "A true thought leader with deep self-awareness" },
    { min: 10, badge: "Expert", description: "Consistently reflecting and growing" },
    { min: 6, badge: "Senior", description: "Building strong reflective habits" },
    { min: 3, badge: "Emerging", description: "Developing a reflective mindset" },
    { min: 1, badge: "Starter", description: "Took the first step toward self-reflection" },
    { min: 0, badge: "Newcomer", description: "Start adding reflections to earn badges" },
  ];
  const badgeTier = BADGE_TIERS.find((t) => reflextionCount >= t.min)!;
  const currentTierIndex = BADGE_TIERS.indexOf(badgeTier);
  const nextTier = currentTierIndex > 0 ? BADGE_TIERS[currentTierIndex - 1] : null;
  const reflextionsToNextBadge = nextTier ? nextTier.min - reflextionCount : 0;

  return {
    strengthPercentage,
    humanAuthenticityScore,
    topSkills,
    badge: {
      name: badgeTier.badge,
      description: badgeTier.description,
      reflextionCount,
      last14DaysReflextionCount,
      nextBadge: nextTier
        ? { name: nextTier.badge, reflextionsNeeded: reflextionsToNextBadge }
        : null,
    },
    completedFields,
    missingFields,
    totalFields: PROFILE_FIELDS.length,
    completedCount: completedFields.length,
    missingCount: missingFields.length,
  };
};

export const UserService = {
  register,
  getAllUserFromDB,
  myProfile,
  updateProfile,
  getSingleUserByIdFromDB,
  deleteUserFromDB,
  blockUser,
  unblockUser,
  addManager,
  getAllAdmins,
  adminDashboardOverview,
  userDashboardOverview,
  monthlyInsight,
  getProfileStrength
};
