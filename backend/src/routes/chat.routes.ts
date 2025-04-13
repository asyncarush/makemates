import { Router, Response } from "express";
import auth from "../middleware/auth";
import { RequestWithUser } from "../typing";
import { logger } from "../config/winston";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get(
  "/search/user",
  auth,
  async (req: RequestWithUser, res: Response) => {
    const { keyword } = req.query;

    // first get all the follow user from relationship table jpin it with users table
    const followUsers = await prisma.relationships.findMany({
      where: {
        follower_id: req.user?.id,
      },
      select: {
        follow_id: true,
      },
    });

    // get all the users from users table
    const users = await prisma.users.findMany({
      where: {
        id: { in: followUsers.map((user) => user.follow_id) },
        name: { contains: keyword as string },
      },
    });

    return res.status(200).json(users);
  }
);

export default router;
