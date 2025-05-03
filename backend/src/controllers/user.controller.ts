/**
 * @fileoverview Controller handling all user-related operations including
 * authentication, profile management, and social interactions.
 */

// Core Express types
import { Request, Response } from "express";

// Database and authentication
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Validation utilities
import { validateNewUser, validateUser } from "../utils/validate";

// Custom types
import { RequestWithUser } from "../typing.js";

const prisma = new PrismaClient();

// Login Function
export async function login(req: Request, res: Response) {
  console.log("Reaching here");
  const { error } = validateUser(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await prisma.users.findUnique({
      where: { email: req.body.email },
      select: { id: true, password: true },
    });

    if (!user) return res.status(400).send("Email id not found");

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (valid) {
      const token = jwt.sign(
        { id: user.id },
        (process.env.JWT_PRIVATE_KEY as string) || "jwt-secret-key",
        { expiresIn: "24hr" }
      );

      // Secure cookie configuration
      const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
        domain: undefined,
        partitioned: false,
        priority: "medium" as const,
      };

      console.log("Setting auth cookie with options:", cookieOptions);

      res.cookie("x-auth-token", token, cookieOptions);
      return res.status(200).send({ id: user.id, token: token });
    } else {
      return res.status(401).send("Incorrect Password");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("An error occurred during login.");
  }
}

// Register Function
export async function register(req: Request, res: Response) {
  console.log("Reaching here- register");
  const { error } = validateNewUser(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    const newUser = await prisma.users.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hash,
        gender: req.body.gender,
        dob: new Date(`${req.body.year}-${req.body.month}-${req.body.day}`),
      },
    });

    // console.log("newUser", newUser);
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_PRIVATE_KEY as string,
      { expiresIn: "24hr" }
    );

    // Secure cookie configuration
    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
      domain: undefined,
      partitioned: false,
      priority: "medium" as const,
    };

    console.log("Setting auth cookie with options:", cookieOptions);

    res.cookie("x-auth-token", token, cookieOptions);
    return res.status(200).send({ id: newUser.id, token: token });
  } catch (err) {
    return res.status(500).send(err);
  }
}

// Get User Data
export async function getUserData(req: RequestWithUser, res: Response) {
  const id = req.user?.id || -1;

  try {
    const user = await prisma.users.findUnique({
      where: { id },
      // include: {
      //   profileimages: true,
      // },
    });

    if (!user) return res.status(404).send("User not found");

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      img: user.img,
      password: "************",
    };

    return res.status(200).send(userData);
  } catch (err) {
    return res.status(500).send("An error occurred while fetching user data.");
  }
}

// Update User Info
export async function updateUserInfo(req: RequestWithUser, res: Response) {
  const id = req.user?.id || -1;
  const { key, value }: any = req.body;

  try {
    switch (key) {
      case "name":
      case "email":
      case "mobile_number":
      case "city":
      case "state":
      case "country":
        await prisma.users.update({
          where: { id },
          data: { [key]: value },
        });
        return res
          .status(200)
          .send(
            `${
              key.charAt(0).toUpperCase() + key.slice(1)
            } updated Successfully.`
          );

      case "password":
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(value, salt);
        await prisma.users.update({
          where: { id },
          data: { password: hash },
        });
        return res.status(200).send("Password updated Successfully.");

      case "birthday":
        await prisma.users.update({
          where: { id },
          data: { dob: new Date(value) }, // Assuming value is in YYYY-MM-DD format
        });
        return res.status(200).send("Birthday updated Successfully.");

      default:
        return res.status(400).send("Invalid update key.");
    }
  } catch (err) {
    return res
      .status(500)
      .send("An error occurred while updating user information.");
  }
}

// Follow User
export async function followUser(req: RequestWithUser, res: Response) {
  const id = req.user?.id || -1;
  const { friendId }: any = req.body;

  // console.log("User Id:", id);
  // console.log("friend Id:", friendId);

  try {
    await prisma.relationships.create({
      data: {
        follow_id: parseInt(friendId),
        follower_id: id,
      },
    });
    return res.status(200).send("Followed Successfully.");
  } catch (err) {
    return res.status(500).send("An error occurred while following user.");
  }
}

// Unfollow User
export async function unfollowUser(req: RequestWithUser, res: Response) {
  const id = req.user?.id || -1;
  const { friendId }: any = req.body;

  if (!friendId) {
    return res.status(400).send("Friend ID is required");
  }

  try {
    // First check if the relationship exists
    const existingRelationship = await prisma.relationships.findFirst({
      where: {
        follow_id: parseInt(friendId),
        follower_id: id,
      },
    });

    if (!existingRelationship) {
      return res.status(404).send("No relationship found to unfollow");
    }

    await prisma.relationships.deleteMany({
      where: {
        follow_id: parseInt(friendId),
        follower_id: id,
      },
    });

    return res.status(200).send("Unfollowed Successfully.");
  } catch (err) {
    console.error("Error in unfollowUser:", err);
    return res.status(500).send("An error occurred while unfollowing user.");
  }
}

// Get Friend List
export async function getFriendList(req: RequestWithUser, res: Response) {
  const id = req.user?.id || -1;

  try {
    const relationships = await prisma.relationships.findMany({
      where: { follower_id: id },
      include: {
        users_relationships_follow_idTousers: {
          include: {
            profileimages: true,
          },
        },
      },
    });

    const friendList = relationships.map((rel) => ({
      follow_id: rel.follow_id,
      follower_id: rel.follower_id,
      name: rel.users_relationships_follow_idTousers.name,
      email: rel.users_relationships_follow_idTousers.email,
      mobile_number: rel.users_relationships_follow_idTousers.mobile_number,
      city: rel.users_relationships_follow_idTousers.city,
      profileImage:
        rel.users_relationships_follow_idTousers.profileimages.length > 0
          ? rel.users_relationships_follow_idTousers.profileimages[0].image_url
          : null,
    }));

    return res.status(200).send(friendList);
  } catch (err) {
    return res
      .status(500)
      .send("An error occurred while fetching friend list.");
  }
}

// Set Profile Picture
export async function setProfilePic(req: RequestWithUser, res: Response) {
  // console.log("Reached here...");

  const id = req.user?.id || -1;
  const { profileImgUrl }: any = req.body;

  try {
    // Create a new profile image record
    const profileImage = await prisma.profileimages.create({
      data: {
        user_id: id,
        image_url: profileImgUrl,
        currentImg: true,
      },
    });

    // console.log("profileImage");

    // Update the user's profile image reference
    await prisma.users.update({
      where: { id },
      data: { img: profileImage.image_url },
    });

    return res.status(200).send("Profile picture updated successfully.");
  } catch (err) {
    return res.status(500).send({ error: err });
  }
}

// Logout User
export function logoutUser(req: Request, res: Response) {
  try {
    // Clear auth cookie
    res.clearCookie("x-auth-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      path: "/",
    });

    return res.status(200).send("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).send("Error during logout");
  }
}

// Get User Notifications
export async function getUserNotifications(
  req: RequestWithUser,
  res: Response
) {
  const userId = req.user?.id || -1;

  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        user_reciever_id: userId,
      },
      include: {
        sender: {
          select: {
            name: true,
            img: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to most recent 50 notifications
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).send("Error fetching notifications");
  }
}
