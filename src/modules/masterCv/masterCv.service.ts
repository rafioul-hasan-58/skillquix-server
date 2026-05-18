
import httpStatus from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import { MasterCvInput } from "./masterCv.validation";

const createMasterCv = async (userId: string, payload: MasterCvInput) => {
  const existing = await prisma.masterCv.findUnique({ where: { userId } });

  return prisma.masterCv.upsert({
    where: { userId },
    update: {
      fullName: payload.fullName,
      email: payload.email,
      location: payload.location,
      bio: payload.bio,
      careerStage: payload.careerStage,
      carrierGoal: payload.carrierGoal,
      challenges: [...(existing?.challenges as any[] ?? []), ...(payload.challenges ?? [])],
      currentRole: payload.currentRole,
      domain: payload.domain,
      educationsAndCertifications: [...(existing?.educationsAndCertifications as any[] ?? []), ...(payload.educationsAndCertifications ?? [])],
      industry: payload.industry,
      linkedinUrl: payload.linkedinUrl,
      phoneNumber: payload.phoneNumber,
      portfolioUrl: payload.portfolioUrl,
      resumeSummary: payload.resumeSummary,
      strength: payload.strength,
      subDomain: payload.subDomain,
      workExpariences: [...(existing?.workExpariences as any[] ?? []), ...(payload.workExpariences ?? [])],
    },
    create: {
      userId,
      fullName: payload.fullName,
      email: payload.email,
      location: payload.location,
      bio: payload.bio,
      careerStage: payload.careerStage,
      carrierGoal: payload.carrierGoal,
      challenges: payload.challenges ?? [],
      currentRole: payload.currentRole,
      domain: payload.domain,
      educationsAndCertifications: payload.educationsAndCertifications ?? [],
      industry: payload.industry,
      linkedinUrl: payload.linkedinUrl,
      phoneNumber: payload.phoneNumber,
      portfolioUrl: payload.portfolioUrl,
      resumeSummary: payload.resumeSummary,
      strength: payload.strength,
      subDomain: payload.subDomain,
      workExpariences: payload.workExpariences ?? [],
    }
  });
};

const getMasterCv = async (userId: string) => {
  const result = await prisma.masterCv.findUnique({
    where: { userId },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "MasterCv not found!");
  }

  return result;
};


const deleteMasterCv = async (userId: string) => {
  const result = await prisma.masterCv.findUnique({ where: { userId } });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "MasterCv not found!");
  }

  return prisma.masterCv.delete({ where: { userId } });
};

export const MasterCvService = {
  getMasterCv,
  deleteMasterCv,
  createMasterCv
};