import status from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../infrastructure/builder/QueryBuilder";

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

const shapeData = (templateId: string, doc: any) => {
  const edu = (doc.educationsAndCertifications as any[]) ?? [];
  const exp = (doc.workExperiences as any[]) ?? [];
  const skills = ((doc.skills as any[]) ?? []).map((s: any) => s.skillName);
  const profileImage = doc.user?.profileImage ?? '';

  switch (templateId) {
    case 'temp-01':
      return {
        name:         doc.fullName,
        title:        doc.currentRole,
        profileImage,
        about:        doc.resumeSummary,
        email:        doc.email,
        address:      doc.location,
        phone:        doc.phoneNumber,
        linkedin:     doc.linkedinUrl,
        portfolio:    doc.portfolioUrl,
        education: edu.map((e) => ({
          startYear:   '',
          endYear:     e.passingYear ?? '',
          institution: e.institution ?? '',
          degree:      e.degree ?? '',
          points:      [],
        })),
        experience: exp.map((e) => ({
          role:      e.position ?? '',
          startYear: '',
          endYear:   '',
          company:   e.company ?? '',
          points:    e.responsibilities ? [e.responsibilities] : [],
        })),
      };

    case 'temp-02':
      return {
        name:         doc.fullName,
        title:        doc.currentRole,
        profileImage,
        profile:      doc.resumeSummary,
        skills,
        email:        doc.email,
        address:      doc.location,
        phone:        doc.phoneNumber,
        linkedin:     doc.linkedinUrl,
        portfolio:    doc.portfolioUrl,
        education: edu.map((e) => ({
          startYear:   '',
          endYear:     e.passingYear ?? '',
          institution: e.institution ?? '',
          degree:      e.degree ?? '',
          gpa:         '',
        })),
        experience: exp.map((e) => ({
          company: e.company ?? '',
          role:    e.position ?? '',
          points:  e.responsibilities ? [e.responsibilities] : [],
        })),
      };

    case 'temp-03':
      return {
        name:         doc.fullName,
        title:        doc.currentRole,
        profileImage,
        profile:      doc.resumeSummary,
        phone:        doc.phoneNumber,
        email:        doc.email,
        website:      doc.portfolioUrl,
        address:      doc.location,
        languages:    doc.languages ?? [],
        skills,
        hobbies:      [],
        education: edu.map((e) => ({
          degree:      e.degree ?? '',
          institution: e.institution ?? '',
          honors:      [],
        })),
        experience: exp.map((e) => ({
          title:    e.position ?? '',
          company:  e.company ?? '',
          location: '',
          period:   e.duration ?? '',
          points:   e.responsibilities ? [e.responsibilities] : [],
        })),
      };

    case 'temp-04':
      return {
        name:         doc.fullName,
        title:        doc.currentRole,
        profileImage,
        profile:      doc.resumeSummary,
        address:      doc.location,
        phone:        doc.phoneNumber,
        email:        doc.email,
        skills,
        certifications: edu
          .filter((e) => e.certificateName)
          .map((e) => e.certificateName),
        education: edu.map((e) => ({
          degree:     e.degree ?? '',
          university: e.institution ?? '',
          period:     e.passingYear ?? '',
          gpa:        '',
        })),
        experience: exp.map((e) => ({
          role:    e.position ?? '',
          company: e.company ?? '',
          bullets: e.responsibilities ? [e.responsibilities] : [],
        })),
      };

    case 'temp-05': {
      const [firstName, ...rest] = (doc.fullName ?? '').split(' ');
      return {
        firstName,
        name:         rest.join(' ') || firstName,
        title:        doc.currentRole,
        profileImage,
        summary:      doc.resumeSummary,
        phone:        doc.phoneNumber,
        email:        doc.email,
        address:      doc.location,
        website:      doc.portfolioUrl,
        skills,
        education: edu.map((e) => ({
          school:      e.institution ?? '',
          institution: e.institution ?? '',
          period:      e.passingYear ?? '',
        })),
        experience: exp.map((e) => ({
          title:   e.position ?? '',
          company: e.company ?? '',
          period:  e.duration ?? '',
          bullets: e.responsibilities ? [e.responsibilities] : [],
        })),
      };
    }

    case 'temp-06':
      return {
        name:         doc.fullName,
        title:        doc.currentRole,
        profileImage,
        about:        doc.resumeSummary,
        phone:        doc.phoneNumber,
        email:        doc.email,
        website:      doc.portfolioUrl,
        address:      doc.location,
        skills,
        education: edu.map((e) => ({
          degree:      e.degree ?? '',
          institution: e.institution ?? '',
          period:      e.passingYear ?? '',
        })),
        experience: exp.map((e) => ({
          role:        e.position ?? '',
          period:      e.duration ?? '',
          company:     e.company ?? '',
          description: e.responsibilities ?? '',
        })),
      };

    case 'temp-07':
      return {
        name:         doc.fullName,
        title:        doc.currentRole,
        profileImage,
        about:        doc.resumeSummary,
        phone:        doc.phoneNumber,
        email:        doc.email,
        website:      doc.portfolioUrl,
        address:      doc.location,
        skills,
        education: edu.map((e) => ({
          degree:      e.degree ?? '',
          institution: e.institution ?? '',
          period:      e.passingYear ?? '',
        })),
        experience: exp.map((e) => ({
          role:    e.position ?? '',
          period:  e.duration ?? '',
          company: e.company ?? '',
          points:  e.responsibilities ? [e.responsibilities] : [],
        })),
      };

    case 'temp-08':
      return {
        name:    doc.fullName,
        title:   doc.currentRole,
        summary: doc.resumeSummary,
        email:   doc.email,
        phone:   doc.phoneNumber,
        address: doc.location,
        skills,
        education: edu.map((e) => ({
          degree:      e.degree ?? '',
          institution: e.institution ?? '',
          period:      e.passingYear ?? '',
        })),
        languages: (doc.languages ?? []).map((lang: string) => ({
          language: lang,
          level:    '',
        })),
        experience: exp.map((e) => ({
          title:   e.position ?? '',
          company: e.company ?? '',
          period:  e.duration ?? '',
          bullets: e.responsibilities ? [e.responsibilities] : [],
        })),
      };
  }
};

const getTemplateData = async (userId: string, templateId: string) => {
  const select = TEMPLATE_FIELDS[templateId];
  console.log("select",select)
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
  getAll,
  getSingle,
  getByUserId,
  delete: deleteEnhancedMasterCv,
  getTemplateData
};