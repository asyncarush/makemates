"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUser = exports.checkFollowed = exports.getUserProfile = void 0;
const client_1 = require("@prisma/client");
const winston_1 = require("../config/winston");
const prisma = new client_1.PrismaClient();
// Get User Profile
const getUserProfile = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.id;
    console.log("looking for user with id : ", userId);
    try {
      const userData = yield prisma.users.findUnique({
        where: { id: parseInt(userId) },
        // include: {
        //   profileimages: true, // Adjust if the relation is named differently in Prisma schema
        // },
      });
      if (userData) {
        // Fetch user's posts
        const userPosts = yield prisma.posts.findMany({
          where: { user_id: parseInt(userId) },
          orderBy: { date: "desc" },
          include: {
            post_media: true,
            users: {
              include: {
                profileimages: true, // Adjust if needed
              },
            },
          },
        });
        return res.status(200).send({ userData, userPosts });
      } else {
        return res.status(204).send("User not Found");
      }
    } catch (err) {
      if (err instanceof Error) {
        winston_1.logger.error(err.message);
        return res.status(500).send(err.message);
      }
      winston_1.logger.error("An unknown error occurred.");
      return res.status(500).send("An unknown error occurred.");
    }
  });
exports.getUserProfile = getUserProfile;
// Check if User is Followed
const checkFollowed = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { friendId } = req.body;
    try {
      const relationship = yield prisma.relationships.findFirst({
        where: {
          follower_id:
            ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
          follow_id: friendId,
        },
      });
      if (relationship) {
        return res.status(200).send("USER_FOUND");
      } else {
        return res.status(200).send("USER_NOT_FOUND");
      }
    } catch (err) {
      if (err instanceof Error) {
        winston_1.logger.error(err.message);
        return res.status(500).send(err.message);
      }
      winston_1.logger.error("An unknown error occurred.");
      return res.status(500).send("An unknown error occurred.");
    }
  });
exports.checkFollowed = checkFollowed;
// Search User
const searchUser = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { keyword } = req.body;
    try {
      const users = yield prisma.users.findMany({
        where: {
          name: {
            contains: keyword.toLowerCase(),
          },
        },
        include: {
          profileimages: true, // Adjust if needed
        },
      });
      return res.status(200).send(users);
    } catch (err) {
      if (err instanceof Error) {
        winston_1.logger.error(err.message);
        return res.status(500).send(err.message);
      }
      winston_1.logger.error("An unknown error occurred.");
      return res.status(500).send("An unknown error occurred.");
    }
  });
exports.searchUser = searchUser;
