import status from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../infrastructure/builder/QueryBuilder";
import { mailService } from "../../infrastructure/mail/mail.service";

const create = async (payload: any) => {
  const result = await prisma.contactMessage.create({
    data: payload,
  });

  await mailService.sendContactMessage(payload);

  return result;
};

const getAll = async (query: Record<string, unknown>) => {
  const contactMessageQuery = new QueryBuilder(prisma.contactMessage, query)
    .search([]) // TODO: add searchable fields e.g. [\"name\", \"email\"]
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
};

const getSingle = async (id: string) => {
  const result = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!result) {
    throw new ApiError(status.NOT_FOUND, "ContactMessage not found!");
  }

  return result;
};

const update = async (id: string, payload: any) => {
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
};

const deleteContactMessage = async (id: string) => {
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
};

const sendFeedBack = async (userId: string, message: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  const payload = {
    name: user.fullName,
    email: user.email,
    message,
    createdAt: new Date().toISOString(),
  }

  await mailService.sendFeedBack(payload);

};

export const ContactMessageService = {
  create,
  getAll,
  getSingle,
  update,
  delete: deleteContactMessage,
  sendFeedBack
};
