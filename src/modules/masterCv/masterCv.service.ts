
import httpStatus from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import { MasterCvInput } from "./masterCv.validation";
import puppeteer from "puppeteer";
import { generateTemp1Html } from "./templates/template1";
import { generateTemp2Html } from "./templates/template2";
import { generateTemp3Html } from "./templates/template3";
import { generateTemp4Html } from "./templates/template4";

const generateCvPdf = async (userId: string, templateId: string, payload: any): Promise<Buffer> => {

  const masterCv = await prisma.masterCv.findUnique(
    {
      where: { userId },
    }
  );

  if (!masterCv) {
    throw new ApiError(httpStatus.NOT_FOUND, "MasterCv not found!");
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",   // important for VPS/Docker
        "--disable-gpu",
        "--no-zygote",
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
    });

    const page = await browser.newPage();
    let html;

    // Inject the HTML template with user data
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
      default:
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid template ID!");
    }
    await page.setContent(html, { waitUntil: "load" });
    // Wait for fonts and images to finish rendering
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Set A4 page size
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


export const MasterCvService = {
  getMasterCv,
  deleteMasterCv,
  createMasterCv,
  generateCvPdf
};