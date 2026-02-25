import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { SkillService } from "./skill.service";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";


export const SkillController = {
    create: catchAsync(async (req: Request, res: Response) => {
        const { id: userId } = req.user;
        const result = await SkillService.create(userId, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Skill created successfully!",
            data: result
        });
    }),
    getMy: catchAsync(async (req: Request, res: Response) => {
        const { id: userId } = req.user;
        const result = await SkillService.getMy(userId, req.query);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "My skill fetched successfully!",
            data: result
        });
    }),
    updateSkill: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await SkillService.updateSkill(id, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Skill updated successfully!",
            data: result
        });
    }),
    deleteSkill: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        await SkillService.deleteSkill(id);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Skill deleted successfully!",
        });
    })
}