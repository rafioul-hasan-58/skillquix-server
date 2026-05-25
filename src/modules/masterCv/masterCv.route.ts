// masterCv.routes.ts
import { Router } from "express";
import { MasterCvController } from "./masterCv.controller";
import auth from "../../app/middlewares/auth";
import { validateTemplate } from "../../app/middlewares/validateTemplate";
import validateRequest from "../../app/middlewares/validateRequest";
import { challengeSchema } from "./masterCv.validation";


const router = Router();

router.post(
    "/create",
    auth(),
    MasterCvController.createMasterCv
);

router.post(
    "/download-pdf/:templateId",
    auth(),
    // validateTemplate,
    MasterCvController.downloadCvPdf
);


router.get(
    "/get",
    auth(),
    MasterCvController.getMasterCv
);

router.delete(
    "/delete/:userId",
    auth(),
    MasterCvController.deleteMasterCv
);

router.post(
    "/add-challenge",
    auth(),
    validateRequest(challengeSchema),
    MasterCvController.addChallange
);
router.get(
    "/get-challenge-story",
    auth(),
    MasterCvController.getChallengeStory
);

export const MasterCvRouter = router;