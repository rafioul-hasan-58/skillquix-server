import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { mailService } from "../../mail/mail.service";

export const ContactMessageService = {
  create: async (payload: any) => {
    const result = await prisma.contactMessage.create({
      data: payload,
    });

    await mailService.sendContactMessage(payload);

    return result;
  },

  getAll: async (query: Record<string, unknown>) => {
    const contactMessageQuery = new QueryBuilder(prisma.contactMessage, query)
      .search([]) // TODO: add searchable fields e.g. ["name", "email"]
      .filter()
      .paginate();

    const [result, meta] = await Promise.all([
      contactMessageQuery.execute(),
      contactMessageQuery.countTotal(),
    ]);

    if (!result.length) {
      throw new ApiError(status.NOT_FOUND, "No contactMessage found!");
    }

    return { meta, data: result };
  },

  getSingle: async (id: string) => {
    const result = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!result) {
      throw new ApiError(status.NOT_FOUND, "ContactMessage not found!");
    }

    return result;
  },

  update: async (id: string, payload: any) => {
    const isExist = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "ContactMessage not found!");
    }

    const result = await prisma.contactMessage.update({
      where: { id },
      data: payload,
    });

    return result;
  },

  delete: async (id: string) => {
    const isExist = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "ContactMessage not found!");
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return null;
  },
};
