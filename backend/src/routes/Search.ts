import { Router } from "express";
import {
  checkFollowed,
  getUserProfile,
  searchUser,
} from "../controller/Search";
import auth from "../middleware/auth";

const router: Router = Router();

router.post("/profile", auth, getUserProfile);
router.post("/user", auth, searchUser);
router.post("/checkFollowed", auth, checkFollowed);

export default router;
