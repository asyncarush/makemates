"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostComments = exports.postNewComment = exports.checkPostLikeStatus = exports.unLikeThePost = exports.likeThePost = exports.getUserPosts = exports.addPost = void 0;
const client_1 = require("@prisma/client");
const winston_1 = require("../config/winston");
const prisma = new client_1.PrismaClient();
// Add Post
const addPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { desc, imgUrl } = req.body;
    try {
        const post = yield prisma.posts.create({
            data: {
                user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
                desc: desc,
            },
        });
        yield prisma.post_media.create({
            data: {
                post_id: post.id,
                media_url: imgUrl,
                user_id: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || -1,
            },
        });
        return res.status(200).send("Post uploaded...");
    }
    catch (err) {
        if (err instanceof Error) {
            winston_1.logger.error(err.message);
            return res.status(500).send(err.message);
        }
        winston_1.logger.error("An unknown error occurred.");
        return res.status(500).send("An unknown error occurred.");
    }
});
exports.addPost = addPost;
// Get User Posts
const getUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        // get all the followers list
        const followers = yield prisma.relationships.findMany({
            where: { follower_id: parseInt(userId) },
        });
        const followersId = followers.map((item) => item.follow_id);
        // get all posts whoes post's user id are in followersId
        // console.log("Follower Id : ", followersId);
        const posts = yield prisma.posts.findMany({
            where: {
                OR: [
                    { user_id: { in: followersId } }, // Posts by followed users
                    { user_id: parseInt(userId, 10) }, // Your own posts
                ],
            },
            orderBy: { date: "desc" },
            include: {
                post_media: true,
                users: {
                    include: {
                        profileimages: true,
                    },
                },
            },
        });
        console.log("all posts : ", posts);
        return res.status(200).send(posts);
    }
    catch (err) {
        if (err instanceof Error) {
            winston_1.logger.error(err.message);
            return res.status(500).send(err.message);
        }
        winston_1.logger.error("An unknown error occurred.");
        return res.status(500).send("An unknown error occurred.");
    }
});
exports.getUserPosts = getUserPosts;
// Like the Post
const likeThePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId } = req.body;
    try {
        yield prisma.likes.create({
            data: {
                post_id: postId,
                user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
            },
        });
        return res.status(200).send(true);
    }
    catch (err) {
        if (err instanceof Error) {
            winston_1.logger.error("Post hasn't been liked...", err.message);
            return res.status(500).send(err.message);
        }
        winston_1.logger.error("An unknown error occurred.");
        return res.status(500).send("An unknown error occurred.");
    }
});
exports.likeThePost = likeThePost;
// Unlike the Post
const unLikeThePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId } = req.body;
    try {
        yield prisma.likes.deleteMany({
            where: {
                user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
                post_id: postId,
            },
        });
        return res.status(200).send(true);
    }
    catch (err) {
        if (err instanceof Error) {
            winston_1.logger.error(err.message);
            return res.status(500).send(err.message);
        }
        winston_1.logger.error("An unknown error occurred.");
        return res.status(500).send("An unknown error occurred.");
    }
});
exports.unLikeThePost = unLikeThePost;
// Check Post Like Status
const checkPostLikeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId } = req.body;
    try {
        const like = yield prisma.likes.findFirst({
            where: {
                user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
                post_id: postId,
            },
        });
        return res.status(200).send(!!like);
    }
    catch (err) {
        if (err instanceof Error) {
            winston_1.logger.error(err.message);
            return res.status(500).send(err.message);
        }
        winston_1.logger.error("An unknown error occurred.");
        return res.status(500).send("An unknown error occurred.");
    }
});
exports.checkPostLikeStatus = checkPostLikeStatus;
// Post New Comment
const postNewComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId, desc } = req.body;
    try {
        yield prisma.comments.create({
            data: {
                user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
                post_id: postId,
                desc: desc,
            },
        });
        return res.status(200).send("success");
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(400).send(err.message);
        }
        return res.status(400).send("An unknown error occurred.");
    }
});
exports.postNewComment = postNewComment;
// Get Post Comments
const getPostComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    try {
        const comments = yield prisma.comments.findMany({
            where: { post_id: parseInt(postId, 10) },
            include: {
                users: true,
            },
        });
        return res.status(200).send(comments);
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(400).send(err.message);
        }
        return res.status(400).send("An unknown error occurred.");
    }
});
exports.getPostComments = getPostComments;
