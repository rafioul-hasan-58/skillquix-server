
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
import { enhanceChallenge } from "./masterCv.helper";
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
  payload: any
): Promise<Buffer> => {
  const masterCv = await prisma.masterCv.findUnique({
    where: { userId },
  });

  if (!masterCv) {
    throw new ApiError(httpStatus.NOT_FOUND, "MasterCv not found!");
  }

  let browser = null;

  const execPath = getExecutablePath();
  console.log("Using executable:", execPath);

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
      ],
      executablePath: execPath,
    });

    const page = await browser.newPage();
    let html;

    switch (templateId) {
      case "temp-01":
        html = generateTemp1Html(payload);
        break;
      case "temp-02":
        html = generateTemp2Html(payload);
        break;
      case "temp-03":
        html = generateTemp3Html(payload);
        break;
      case "temp-04":
        html = generateTemp4Html(payload);
        break;
      case "temp-05":
        html = generateTemp5Html(payload);
        break;
      case "temp-06":
        html = generateTemp6Html(payload);
        break;
      case "temp-07":
        html = generateTemp7Html(payload);
        break;
      case "temp-08":
        html = generateTemp8Html(payload);
        break;
      default:
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid template ID!");
    }

    await page.setContent(html, { waitUntil: "load" });

    // Wait for fonts and images to finish rendering
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Puppeteer error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to generate PDF. Please try again."
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
// const generateCvPdf = async (userId: string, templateId: string, payload: any): Promise<Buffer> => {

//   const masterCv = await prisma.masterCv.findUnique(
//     {
//       where: { userId },
//     }
//   );

//   if (!masterCv) {
//     throw new ApiError(httpStatus.NOT_FOUND, "MasterCv not found!");
//   }

//   let browser = null;
//   console.log("Executable path:", process.env.PUPPETEER_EXECUTABLE_PATH);
//   console.log("Skip download:", process.env.PUPPETEER_SKIP_DOWNLOAD);
//   try {
//     browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",   // important for VPS/Docker
//         "--disable-gpu",
//         "--no-zygote",
//       ],
//       executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
//     });

//     const page = await browser.newPage();
//     let html;

//     // Inject the HTML template with user data
//     switch (templateId) {
//       case "temp-01":
//         html = generateTemp1Html(payload);
//         break;
//       case "temp-02":
//         html = generateTemp2Html(payload);
//         break;
//       case "temp-03":
//         html = generateTemp3Html(payload);
//         break;
//       case "temp-04":
//         html = generateTemp4Html(payload);
//         break;
//       case "temp-05":
//       default:
//         throw new ApiError(httpStatus.BAD_REQUEST, "Invalid template ID!");
//     }
//     await page.setContent(html, { waitUntil: "load" });
//     // Wait for fonts and images to finish rendering
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     // Set A4 page size
//     await page.emulateMediaType("screen");

//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: {
//         top: "0px",
//         right: "0px",
//         bottom: "0px",
//         left: "0px",
//       },
//     });

//     return Buffer.from(pdfBuffer);
//   } catch (error) {
//     // console.log("error", error)
//     throw new ApiError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       "Failed to generate PDF. Please try again."
//     );
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// };

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
      educationsAndCertifications: [...(existing?.educationsAndCertifications as any[] ?? []), ...(payload.educationsAndCertifications ?? [])],
      industry: payload.industry,
      linkedinUrl: payload.linkedinUrl,
      phoneNumber: payload.phoneNumber,
      portfolioUrl: payload.portfolioUrl,
      resumeSummary: payload.resumeSummary,
      strength: payload.strength,
      workExperiences: [...(existing?.workExperiences as any[] ?? []), ...(payload.workExperiences ?? [])],
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
  generateCvPdf,
  addChallange,
  getChallengeStory
};