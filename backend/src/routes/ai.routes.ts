import { Router } from "express";
import auth from "../middleware/auth";
import { getNotificationSummary } from "../controllers/ai.controller";
const router = Router();

router.get("/notificationSummary", auth, getNotificationSummary);

export default router;
