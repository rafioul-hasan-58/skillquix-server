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
      enhancedMasterCv: {
        select: {
          id: true,
          workExperiences: true,
          aiScore: true,
          skills: true,
          carrierGoal: true,
          currentRole: true,
          createdAt: true,
          futureVision: true,
        },
      },
      masterCv: {
        select: {
          currentRole: true,
          createdAt: true,
        },
      },
      reflextions: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          shortSummary: true,
          createdAt: true,
        },
      },
      skills: {
        orderBy: { createdAt: "asc" },
        select: {
          skillName: true,
          createdAt: true,
        },
      },
      _count: { select: { skills: true, reflextions: true } },
      profileScore: true,
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysReflextionCount = await prisma.reflextion.count({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
  });

  let reflectionConsistencyScore = 0;
  let reflectionConsistencyTag = "Needs Start";

  if (reflextionCount > 0) {
    if (last30DaysReflextionCount >= 8) {
      reflectionConsistencyScore = Math.min(100, 90 + (last30DaysReflextionCount - 8));
      reflectionConsistencyTag = "Excellent";
    } else if (last30DaysReflextionCount >= 4) {
      reflectionConsistencyScore = 70 + (last30DaysReflextionCount - 4) * 5;
      reflectionConsistencyTag = "Good";
    } else if (last30DaysReflextionCount >= 1) {
      reflectionConsistencyScore = 30 + (last30DaysReflextionCount - 1) * 13;
      reflectionConsistencyTag = "Progressive";
    } else {
      reflectionConsistencyScore = 15;
      reflectionConsistencyTag = "Progressive";
    }
  }

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
  const badgeProgress = nextTier
    ? Math.round(((reflextionCount - badgeTier.min) / (nextTier.min - badgeTier.min)) * 100)
    : 100;

  // Milestone / Timeline Data Construction
  const firstReflection = user.reflextions?.[0] || null;
  const firstReflectionMilestone = firstReflection
    ? {
      year: new Date(firstReflection.createdAt).getFullYear(),
      shortSummary: firstReflection.shortSummary,
    }
    : null;

  const careerGoalMilestone = user.enhancedMasterCv?.carrierGoal
    ? {
      year: new Date(user.enhancedMasterCv.createdAt).getFullYear(),
      carrierGoal: user.enhancedMasterCv.carrierGoal,
    }
    : null;

  const firstSkills = user.skills || [];
  const skillsMilestone = firstSkills.length > 0
    ? {
      year: new Date(firstSkills[0].createdAt).getFullYear(),
      skills: firstSkills.slice(0, 4).map((s) => s.skillName),
    }
    : null;

  const masterCvMilestone = user.masterCv
    ? {
      year: new Date(user.masterCv.createdAt).getFullYear(),
    }
    : null;

  const currentRole = user.enhancedMasterCv?.currentRole || user.masterCv?.currentRole || null;
  const currentPositionMilestone = {
    year: "Today",
    currentRole: currentRole,
  };

  const fVision = user.enhancedMasterCv?.futureVision as { position?: string; target?: string } | null;
  const futureVisionMilestone = {
    year: fVision?.target && fVision.target,
    futureVision: fVision?.position && fVision?.target
      ? `Future vision ${fVision.position} ${fVision.target}`
      : "Future vision Target future role",
  };

  const milestonesList = [
    ...(firstReflectionMilestone ? [{ type: "firstReflextion", ...firstReflectionMilestone }] : []),
    ...(skillsMilestone ? [{ type: "skillsIdentified", ...skillsMilestone }] : []),
    ...(masterCvMilestone ? [{ type: "masterCvCreated", ...masterCvMilestone }] : []),
    ...(careerGoalMilestone ? [{ type: "careerGoal", ...careerGoalMilestone }] : []),
    { type: "currentPosition", ...currentPositionMilestone },
    { type: "futureVision", ...futureVisionMilestone },
  ];


  const carrierHealthReport = {
    careerMomentum: user.profileScore?.CareerMomentum,
    reflectionConsistency: {
      score: reflectionConsistencyScore,
      tag: reflectionConsistencyTag,
    },
    growthDirection: user.profileScore?.GrowthDirection,
    jobReadiness: user.profileScore?.JobReadiness,
    overallAssessment: user.profileScore?.OverallAssessment
  }

  return {
    strengthPercentage,
    humanAuthenticityScore,
    topSkills,
    badge: {
      name: badgeTier.badge,
      description: badgeTier.description,
      progress: badgeProgress,
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
    milestones: milestonesList,
    carrierHealthReport,

  };
};

const computeWeeklyStreak = async (userId: string) => {
  const reflections = await prisma.reflextion.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const getISOWeekKey = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const getPrevWeekKey = (weekKey: string): string => {
    const [yr, wk] = weekKey.split("-W").map(Number);
    const prevDate = new Date(Date.UTC(yr, 0, 1 + (wk - 2) * 7));
    return getISOWeekKey(prevDate);
  };

  const allReflectionDates = reflections.map((r) => new Date(r.createdAt));
  const weekSet = new Set(allReflectionDates.map(getISOWeekKey));
  const sortedWeeks = [...weekSet].sort();

  let currentStreak = 0;
  const todayWeekKey = getISOWeekKey(new Date());
  let startKey = todayWeekKey;
  if (!weekSet.has(todayWeekKey)) {
    const lastWeekKey = getPrevWeekKey(todayWeekKey);
    if (weekSet.has(lastWeekKey)) {
      startKey = lastWeekKey;
    }
  }

  if (weekSet.has(startKey)) {
    let checkKey = startKey;
    while (weekSet.has(checkKey)) {
      currentStreak++;
      checkKey = getPrevWeekKey(checkKey);
    }
  }

  const totalActiveWeeks = sortedWeeks.length;

  return {
    currentStreak,
    totalActiveWeeks,
  };
};

const getConsistencyReport = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profileScore: {
        select: {
          ConfidenceScore: true,
          AIScore: true,
          TopTraits: true,
        },
      },
      _count: {
        select: {
          reflextions: true,
        },
      },
      enhancedMasterCv: {
        select: {
          skills: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  // 1. Current streak & milestones
  const streakInfo = await computeWeeklyStreak(userId);

  const STREAK_MILESTONES = [
    { weeks: 1, label: "First Step", description: "Reflected for the first time!" },
    { weeks: 3, label: "On a Roll", description: "3 weeks of consistent reflection" },
    { weeks: 7, label: "One Month In", description: "7 weeks of steady growth" },
    { weeks: 12, label: "Quarter Strong", description: "12 weeks — a full quarter of reflection" },
    { weeks: 24, label: "Half Year", description: "24 weeks — six months of self-awareness" },
  ];

  const milestones = STREAK_MILESTONES.map((m) => ({
    weeks: m.weeks,
    label: m.label,
    description: m.description,
    achieved: streakInfo.totalActiveWeeks >= m.weeks,
  }));

  // 4. Progress to achieve next reflection milestone
  const reflextionCount = user._count?.reflextions || 0;
  const BADGE_TIERS = [
    { min: 15, badge: "Visionary" },
    { min: 10, badge: "Expert" },
    { min: 6, badge: "Senior" },
    { min: 3, badge: "Emerging" },
    { min: 1, badge: "Starter" },
    { min: 0, badge: "Newcomer" },
  ];

  const badgeTier = BADGE_TIERS.find((t) => reflextionCount >= t.min)!;
  const currentTierIndex = BADGE_TIERS.indexOf(badgeTier);
  const nextTier = currentTierIndex > 0 ? BADGE_TIERS[currentTierIndex - 1] : null;

  const progressToNextMilestone = nextTier
    ? Math.round(((reflextionCount - badgeTier.min) / (nextTier.min - badgeTier.min)) * 100)
    : 100;

  // 2. Confidence growth vs last month percentage and status
  const confidenceScoreRaw = user.profileScore?.ConfidenceScore;
  let confidenceScores: { date: string; score: number }[] = [];
  if (Array.isArray(confidenceScoreRaw)) {
    confidenceScores = confidenceScoreRaw
      .map((item: any) => {
        const rawDate = item?.date;
        const dateStr = typeof rawDate === "string" ? rawDate : (rawDate?.$date || "");
        return {
          date: dateStr,
          score: typeof item?.score === "number" ? item.score : Number(item?.score) || 0,
        };
      })
      .filter((item) => item.date);
  }
  confidenceScores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const calculateGrowthVsLastMonth = (scores: { date: string; score: number }[]) => {
    if (scores.length === 0) {
      return { percentage: 0, status: "neutral" };
    }
    const latest = scores[scores.length - 1].score;
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);

    const pastScores = scores.filter((item) => new Date(item.date) < startOfCurrentMonth);
    let baseline = 0;
    if (pastScores.length > 0) {
      baseline = pastScores[pastScores.length - 1].score;
    } else {
      baseline = scores[0].score;
    }

    const change = latest - baseline;
    let percentage = 0;
    if (baseline > 0) {
      percentage = (change / baseline) * 100;
    } else if (latest > 0) {
      percentage = 100;
    }

    return {
      percentage: Number(Math.abs(percentage).toFixed(2)),
      status: percentage > 0 ? "positive" : (percentage < 0 ? "negative" : "neutral"),
    };
  };

  const confidenceGrowth = calculateGrowthVsLastMonth(confidenceScores);

  // 3. Human authenticity points vs last month points and status
  const aiScoreRaw = user.profileScore?.AIScore;
  let aiScores: { date: string; score: number }[] = [];
  if (Array.isArray(aiScoreRaw)) {
    aiScores = aiScoreRaw
      .map((item: any) => {
        const rawDate = item?.date;
        const dateStr = typeof rawDate === "string" ? rawDate : (rawDate?.$date || "");
        return {
          date: dateStr,
          score: typeof item?.score === "number" ? item.score : (typeof item?.total === "number" ? item.total : Number(item?.total || item?.score) || 0),
        };
      })
      .filter((item) => item.date);
  }
  aiScores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let authenticityGrowth = {
    currentPoints: 0,
    points: 0,
    status: "neutral",
  };

  if (aiScores.length > 0) {
    const latest = aiScores[aiScores.length - 1].score;
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);

    const pastScores = aiScores.filter((item) => new Date(item.date) < startOfCurrentMonth);
    let baseline = 0;
    if (pastScores.length > 0) {
      baseline = pastScores[pastScores.length - 1].score;
    } else {
      baseline = aiScores[0].score;
    }

    const change = latest - baseline;

    authenticityGrowth = {
      currentPoints: latest,
      points: Number(Math.abs(change).toFixed(2)),
      status: change > 0 ? "positive" : (change < 0 ? "negative" : "neutral"),
    };
  }

  // 6. Top 3 skills gained this month ranked by score
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const skillsThisMonth = await prisma.skill.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    },
    select: {
      skillName: true,
    },
  });

  const skillNamesThisMonth = new Set(skillsThisMonth.map((s) => s.skillName.toLowerCase()));
  const rawCvSkills = (user.enhancedMasterCv?.skills as Array<{ skillName: string; score: number }>) || [];
  
  let filteredCvSkills = rawCvSkills.filter((s) => skillNamesThisMonth.has(s.skillName.toLowerCase()));
  if (filteredCvSkills.length === 0) {
    filteredCvSkills = rawCvSkills;
  }

  const topSkills = [...filteredCvSkills]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)
    .map(({ skillName, score }) => ({ skillName, score }));

  const interviewConfidenceTrend = confidenceScores.map((item) => ({
    date: item.date,
    score: item.score,
  }));

  return {
    currentStreak: streakInfo.currentStreak,
    confidenceGrowth,
    authenticityGrowth,
    progressToNextMilestone,
    milestones,
    topSkills,
    topTraits: user.profileScore?.TopTraits || [],
    interviewConfidenceTrend,
  };
};

const getCarrierGrowth = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profileScore: {
        select: {
          ConfidenceScore: true,
        },
      },
      _count: {
        select: {
          reflextions: true,
        },
      },
      reflextions: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          createdAt: true,
          shortSummary: true,
        },
      },
      skills: {
        orderBy: { createdAt: "asc" },
        select: {
          createdAt: true,
          skillName: true,
        },
      },
      resumeProfile: {
        select: {
          createdAt: true,
          summary: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Get weekly reflection streak
  const streakInfo = await computeWeeklyStreak(userId);

  // Get confidence scores from profileScore
  const confidenceScoreRaw = user.profileScore?.ConfidenceScore;
  let confidenceScores: { date: string; score: number }[] = [];
  if (Array.isArray(confidenceScoreRaw)) {
    confidenceScores = confidenceScoreRaw
      .map((item: any) => {
        const rawDate = item?.date;
        const dateStr = typeof rawDate === "string" ? rawDate : (rawDate?.$date || "");
        return {
          date: dateStr,
          score: typeof item?.score === "number" ? item.score : Number(item?.score) || 0,
        };
      })
      .filter((item) => item.date);
  }

  // Sort by date ascending
  confidenceScores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latestScore = confidenceScores.length > 0
    ? confidenceScores[confidenceScores.length - 1].score
    : 0;

  // Find the score from 6 months ago
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // Split scores into past (older than 6 months) and recent (last 6 months)
  const pastScores = confidenceScores.filter((item) => new Date(item.date) < sixMonthsAgo);
  const recentScores = confidenceScores.filter((item) => new Date(item.date) >= sixMonthsAgo);

  let baselineScore = 0;
  if (pastScores.length > 0) {
    // The latest score before the 6 month window
    baselineScore = pastScores[pastScores.length - 1].score;
  } else if (recentScores.length > 0) {
    // If no past scores, use the oldest score in the 6-month window
    baselineScore = recentScores[0].score;
  }

  const delta = latestScore - baselineScore;
  let percentageChange = 0;
  if (baselineScore > 0) {
    percentageChange = (delta / baselineScore) * 100;
  } else if (latestScore > 0) {
    percentageChange = 100;
  }

  // Milestone/Badge progression logic
  const reflextionCount = user._count?.reflextions || 0;
  const BADGE_TIERS = [
    { min: 15, badge: "Visionary" },
    { min: 10, badge: "Expert" },
    { min: 6, badge: "Senior" },
    { min: 3, badge: "Emerging" },
    { min: 1, badge: "Starter" },
    { min: 0, badge: "Newcomer" },
  ];

  const badgeTier = BADGE_TIERS.find((t) => reflextionCount >= t.min)!;
  const currentTierIndex = BADGE_TIERS.indexOf(badgeTier);
  const nextTier = currentTierIndex > 0 ? BADGE_TIERS[currentTierIndex - 1] : null;

  const progressToNextMilestone = nextTier
    ? Math.round(((reflextionCount - badgeTier.min) / (nextTier.min - badgeTier.min)) * 100)
    : 100;

  // Timeline / Milestones construction
  const firstReflection = user.reflextions?.[0] || null;
  const firstReflectionInfo = firstReflection
    ? {
        createdAt: firstReflection.createdAt,
        shortSummary: firstReflection.shortSummary,
      }
    : null;

  const firstSkill = user.skills?.[0] || null;
  const firstThreeSkills = user.skills?.slice(0, 3).map((s) => s.skillName) || [];
  const firstSkillInfo = firstSkill
    ? {
        date: firstSkill.createdAt,
        skills: firstThreeSkills,
      }
    : null;

  const resumeProfileInfo = user.resumeProfile
    ? {
        createdAt: user.resumeProfile.createdAt,
        summary: user.resumeProfile.summary,
      }
    : null;

  return {
    confidenceScore: {
      percentage: Number(Math.abs(percentageChange).toFixed(2)),
      status: percentageChange > 0 ? "positive" : (percentageChange < 0 ? "negative" : "neutral"),
    },
    reflectionMilestoneProgress: {
      currentStreak: streakInfo.currentStreak,
      progressToNextMilestone,
    },
    carrierTimeline: {
      firstReflection: firstReflectionInfo,
      firstSkillDiscovered: firstSkillInfo,
      resumeProfile: resumeProfileInfo,
    },
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
  getProfileStrength,
  getConsistencyReport,
  getCarrierGrowth
};
