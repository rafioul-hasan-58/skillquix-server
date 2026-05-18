// masterCv.routes.ts
import { Router } from "express";
import { MasterCvController } from "./masterCv.controller";
import auth from "../../app/middlewares/auth";


const router = Router();

router.post(
    "/create",
    auth(),
    MasterCvController.createMasterCv
);
router.get(
    "/get/:userId",
    auth(),
    MasterCvController.getMasterCv
);

router.delete(
    "/delete/:userId",
    auth(),
    MasterCvController.deleteMasterCv
);

export const MasterCvRouter = router;