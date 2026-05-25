import status from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../infrastructure/builder/QueryBuilder";
import { Prisma } from "@prisma/client";

const create = async (userId: string, payload: any) => {
  const result = await prisma.enhancedMasterCv.upsert({
    where: { userId },
    update: {
      ...payload,
      version: { increment: 1 },
    },
    create: {
      ...payload,
      userId,
    },
  });

  return result;
};

const update = async (userId: string, payload: any) => {
  const { skills, workExperiences, educationsAndCertifications, ...scalarFields } = payload;

  const existing = await prisma.enhancedMasterCv.findUnique({ where: { userId } });

  const result = await prisma.enhancedMasterCv.update({
    where: { userId },
    data: {
      ...scalarFields,

      ...(skills && {
        skills: [...(existing?.skills as any[] || []), ...skills],
      }),

      ...(workExperiences && {
        workExperiences: [...(existing?.workExperiences as any[] || []), ...workExperiences],
      }),

      ...(educationsAndCertifications && {
        educationsAndCertifications: [...(existing?.educationsAndCertifications as any[] || []), ...educationsAndCertifications],
      }),
    },
  });

  return result;
};
const getAll = async (query: Record<string, unknown>) => {
  const cvQuery = new QueryBuilder(prisma.enhancedMasterCv, query)
    .search(["fullName", "email", "currentRole", "industry", "domain"])
    .filter()
    .paginate();

  const [result, meta] = await Promise.all([
    cvQuery.execute(),
    cvQuery.countTotal(),
  ]);

  if (!result.length) {
    throw new ApiError(status.NOT_FOUND, "No EnhancedMasterCv records found!");
  }

  return { meta, data: result };
};

const getSingle = async (id: string) => {
  const result = await prisma.enhancedMasterCv.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!result) {
    throw new ApiError(status.NOT_FOUND, "EnhancedMasterCv not found!");
  }

  return result;
};

const getByUserId = async (userId: string) => {
  const result = await prisma.enhancedMasterCv.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!result) {
    throw new ApiError(
      status.NOT_FOUND,
      "No EnhancedMasterCv found for this user!"
    );
  }

  return result;
};


const deleteEnhancedMasterCv = async (id: string) => {
  const isExist = await prisma.enhancedMasterCv.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new ApiError(status.NOT_FOUND, "EnhancedMasterCv not found!");
  }

  await prisma.enhancedMasterCv.delete({
    where: { id },
  });

  return null;
};
const TEMPLATE_FIELDS: Record<string, object> = {
  'temp-01': {
    fullName: true, currentRole: true, resumeSummary: true,
    email: true, location: true, phoneNumber: true,
    linkedinUrl: true, portfolioUrl: true,
    educationsAndCertifications: true, workExperiences: true,
    user: { select: { profileImage: true } },
  },
  'temp-02': {
    fullName: true, currentRole: true, resumeSummary: true,
    skills: true, email: true, location: true, phoneNumber: true,
    linkedinUrl: true, portfolioUrl: true,
    educationsAndCertifications: true, workExperiences: true,
    user: { select: { profileImage: true } },
  },
  'temp-03': {
    fullName: true, currentRole: true, resumeSummary: true,
    phoneNumber: true, email: true, portfolioUrl: true,
    location: true, languages: true, skills: true,
    educationsAndCertifications: true, workExperiences: true,
    user: { select: { profileImage: true } },
  },
  'temp-04': {
    fullName: true, currentRole: true, resumeSummary: true,
    location: true, phoneNumber: true, email: true, skills: true,
    educationsAndCertifications: true, workExperiences: true,
    user: { select: { profileImage: true } },
  },
  'temp-05': {
    fullName: true, currentRole: true, resumeSummary: true,
    phoneNumber: true, email: true, location: true,
    portfolioUrl: true, skills: true,
    educationsAndCertifications: true, workExperiences: true,
    user: { select: { profileImage: true } },
  },
  'temp-06': {
    fullName: true, currentRole: true, resumeSummary: true,
    phoneNumber: true, email: true, portfolioUrl: true,
    location: true, skills: true,
    educationsAndCertifications: true, workExperiences: true,
    user: { select: { profileImage: true } },
  },
  'temp-07': {
    fullName: true, currentRole: true, resumeSummary: true,
    phoneNumber: true, email: true, portfolioUrl: true,
    location: true, skills: true,
    educationsAndCertifications: true, workExperiences: true,
    user: { select: { profileImage: true } },
  },
  'temp-08': {
    fullName: true, currentRole: true, resumeSummary: true,
    email: true, phoneNumber: true, location: true, skills: true,
    languages: true, educationsAndCertifications: true, workExperiences: true,
  },
};


const getTemplateData = async (userId: string, templateId: string) => {
  const select = TEMPLATE_FIELDS[templateId];
  console.log("select", select)
  if (!select) {
    throw new Error(`Invalid templateId: ${templateId}`);
  }

  const doc = await prisma.enhancedMasterCv.findUnique({
    where: { userId },
    select,
  });

  if (!doc) {
    throw new Error('No CV found for this user');
  }

  // return shapeData(templateId, doc);

  return doc
};
export const EnhancedMasterCvService = {
  create,
  update,
  getAll,
  getSingle,
  getByUserId,
  delete: deleteEnhancedMasterCv,
  getTemplateData
};