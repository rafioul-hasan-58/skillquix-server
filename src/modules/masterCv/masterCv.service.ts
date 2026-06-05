
import httpStatus from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import { ChallengeInput, MasterCvInput } from "./masterCv.validation";
import puppeteer from "puppeteer";
import { generateTemp1Html } from "./templates/template1";
import { generateTemp2Html } from "./templates/template2";
import { generateTemp3Html } from "./templates/template3";
import { generateTemp4Html } from "./templates/template4";
import os from "os";
import fs from "fs";
import { generateTemp5Html } from "./templates/template5";
import { generateTemp6Html } from "./templates/template6";
import { generateTemp7Html } from "./templates/template7";
import { generateTemp8Html } from "./templates/template8";
import { enhanceChallengeQueue } from "../../infrastructure/queue/queues/masterCv.queue";
import { JOB_NAMES } from "../../infrastructure/queue/queue.constant";

const getExecutablePath = (): string => {
  if (os.platform() === "win32") {
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  }
  return process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";
};


const generateCvPdf = async (
  userId: string,
  templateId: string,
  payload: any          // ← typed as raw frontend shape
): Promise<Buffer> => {
  const masterCv = await prisma.masterCv.findUnique({ where: { userId } });
  if (!masterCv) throw new ApiError(httpStatus.NOT_FOUND, "MasterCv not found!");
  const data = payload

  let browser = null;
  const execPath = getExecutablePath();

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
      executablePath: execPath,
    });

    const page = await browser.newPage();
    let html: string;

    switch (templateId) {
      case "temp-01": html = generateTemp1Html(data); break;
      case "temp-02": html = generateTemp2Html(data); break;
      case "temp-03": html = generateTemp3Html(data); break;
      case "temp-04": html = generateTemp4Html(data); break;
      case "temp-05": html = generateTemp5Html(data); break;
      case "temp-06": html = generateTemp6Html(data); break;
      case "temp-07": html = generateTemp7Html(data); break;
      case "temp-08": html = generateTemp8Html(data); break;
      default: throw new ApiError(httpStatus.BAD_REQUEST, "Invalid template ID!");
    }

    await page.setContent(html, { waitUntil: "load" });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Puppeteer error:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF. Please try again.");
  } finally {
    if (browser) await browser.close();
  }
};
const createMasterCv = async (userId: string, payload: MasterCvInput) => {
  return prisma.masterCv.upsert({
    where: { userId },
    update: {
      fullName: payload.fullName,
      email: payload.email,
      location: payload.location,
      bio: payload.bio,
      careerStage: payload.careerStage,
      carrierGoal: payload.carrierGoal,
      challenges: payload.challenges,
      currentRole: payload.currentRole,
      educationsAndCertifications: payload.educationsAndCertifications,
      industry: payload.industry,
      linkedinUrl: payload.linkedinUrl,
      totalExperienceYear: payload.totalExperienceYear,
      phoneNumber: payload.phoneNumber,
      portfolioUrl: payload.portfolioUrl,
      resumeSummary: payload.resumeSummary,
      strength: payload.strength,
      workExperiences: payload.workExperiences,
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
      educationsAndCertifications: payload.educationsAndCertifications ?? [],
      industry: payload.industry,
      totalExperienceYear: payload.totalExperienceYear,
      linkedinUrl: payload.linkedinUrl,
      phoneNumber: payload.phoneNumber,
      portfolioUrl: payload.portfolioUrl,
      resumeSummary: payload.resumeSummary,
      strength: payload.strength,
      workExperiences: payload.workExperiences ?? [],
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

const addChallange = async (userId: string, payload: ChallengeInput) => {
  const existing = await prisma.masterCv.findUnique({ where: { userId } });

  const result = await prisma.masterCv.update({
    where: { userId },
    data: {
      challenges: [...(existing?.challenges as ChallengeInput[] ?? []), payload],
    }
  });
  enhanceChallengeQueue.add(
    JOB_NAMES.MASTER_CV.ENHANCE_CHALLENGE,
    {
      userId: userId, data: {
        situation: payload.situation,
        task: payload.task,
        action: payload.action,
        result: payload.result,
      }
    },
    { attempts: 3, backoff: { type: "exponential", delay: 2000 } }

  )
  return {
    message: "Challenge is added,We will notify you once it is enhanced"
  }
};
const getChallengeStory = async (userId: string) => {
  const result = await prisma.enhancedMasterCv.findUnique({
    where: {
      userId
    },
    select: {
      id: true,
      challenges: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No enhance master cv is available!");
  }
  return result
}

export const MasterCvService = {
  getMasterCv,
  deleteMasterCv,
  createMasterCv,
  addChallange,
  getChallengeStory,
  generateCvPdf
};