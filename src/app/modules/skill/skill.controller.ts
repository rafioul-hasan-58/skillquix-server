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
    })
}