import status from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../infrastructure/builder/QueryBuilder";

export const FaqService = {
  create: async (payload: any) => {
    const result = await prisma.faq.create({
      data: payload,
    });
    return result;
  },

  getAll: async (query: Record<string, unknown>) => {
    const faqQuery = new QueryBuilder(prisma.faq, query)
      .search([]) // TODO: add searchable fields e.g. ["name", "email"]
      .filter()
      .paginate();

    const [result, meta] = await Promise.all([
      faqQuery.execute(),
      faqQuery.countTotal(),
    ]);

    if (!result.length) {
      throw new ApiError(status.NOT_FOUND, "No faq found!");
    }

    return { meta, data: result };
  },

  getSingle: async (id: string) => {
    const result = await prisma.faq.findUnique({
      where: { id },
    });

    if (!result) {
      throw new ApiError(status.NOT_FOUND, "Faq not found!");
    }

    return result;
  },

  update: async (id: string, payload: any) => {
    const isExist = await prisma.faq.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "Faq not found!");
    }

    const result = await prisma.faq.update({
      where: { id },
      data: payload,
    });

    return result;
  },

  delete: async (id: string) => {
    const isExist = await prisma.faq.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "Faq not found!");
    }

    await prisma.faq.delete({
      where: { id },
    });

    return null;
  },
};
