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

export const EnhancedMasterCvService = {
  create,
  getAll,
  getSingle,
  getByUserId,
  delete: deleteEnhancedMasterCv,
};