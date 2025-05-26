"use strict";
/**
 * @fileoverview Controller for handling post-related operations including
 * creation, modification, deletion, and interaction with posts.
 */
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
exports.removeThisImage = exports.getPostComments = exports.postNewComment = exports.checkPostLikeStatus = exports.unLikeThePost = exports.likeThePost = exports.getUserPosts = exports.editPost = exports.addPost = void 0;
// Database client
const client_1 = require("@prisma/client");
// Logger
const winston_1 = require("../config/winston");
const index_1 = require("../index");
const minio_service_1 = require("../services/minio.service");
const prisma = new client_1.PrismaClient();
// Add Post
/**
 * Creates a new post with the provided description and image URLs.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
const addPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { desc, imgUrls } = req.body;
    try {
        const post = yield prisma.posts.create({
            data: {
                user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
                desc,
            },
        });
        const urls = JSON.parse(imgUrls);
        if (imgUrls && Array.isArray(urls)) {
            yield Promise.all(urls
                .map((media) => {
                var _a;
                // Ensure we're using the URL string, not the entire media object
                const mediaUrl = typeof media === "string" ? media : media === null || media === void 0 ? void 0 : media.url;
                if (!mediaUrl) {
                    console.error("Invalid media URL:", media);
                    return null;
                }
                return prisma.post_media.create({
                    data: {
                        post_id: post.id,
                        media_url: mediaUrl,
                        user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
                    },
                });
            })
                .filter(Boolean) // Filter out any null values from invalid media
            );
        }
        const sender = yield prisma.users.findUnique({
            where: {
                id: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || -1,
            },
            select: {
                name: true,
            },
        });
        console.log("SenderName ", sender);
        // will be used to send notification to the followers
        const notificationData = {
            user_sender_id: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || -1,
            type: "post",
            resource_id: post.id,
            message: `${(sender === null || sender === void 0 ? void 0 : sender.name) || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.id)} has posted something.`,
            isRead: false,
        };
        console.log("Sending notification to : ", notificationData);
        index_1.notificationManager.addNotification("post", notificationData);
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
const editPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { desc, imgUrls } = req.body;
    const { postId } = req.params;
    console.log("Received postId:", postId);
    console.log("Received imgUrls:", imgUrls);
    console.log("Type of imgUrls:", typeof imgUrls);
    const parsedPostId = parseInt(postId, 10);
    if (isNaN(parsedPostId)) {
        return res.status(400).send("Invalid post ID");
    }
    try {
        // First update the post
        const updatedPost = yield prisma.posts.update({
            where: {
                id: parsedPostId,
                user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
            },
            data: {
                desc: desc,
            },
        });
        console.log("Updated post:", updatedPost);
        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }
        // Parse imgUrls if it's a string
        if (!imgUrls) {
            return res.status(200).send("Post Saved...");
        }
        const imageUrlsArray = typeof imgUrls === "string" ? JSON.parse(imgUrls) : imgUrls;
        console.log("Processing imageUrlsArray:", imageUrlsArray);
        // Create new media entries
        if (Array.isArray(imageUrlsArray)) {
            for (let imgs of imageUrlsArray) {
                console.log("Creating media entry for:", imgs);
                yield prisma.post_media.create({
                    data: {
                        post_id: parsedPostId,
                        media_url: imgs,
                        user_id: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || -1,
                    },
                });
            }
        }
        return res.status(200).send("Post Saved...");
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
exports.editPost = editPost;
// Get User Posts
/**
 * Retrieves a list of posts for the specified user, including their own posts and posts from users they follow.
 *
 * @param {Request} req - The incoming request.
 * @param {Response} res - The outgoing response.
 */
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
        // get all the post of users to whom currentUser follow and also contain currentUser own posts as well with the tag if post is liked or not
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
        const allPosts = yield prisma.$queryRaw `SELECT * FROM get_user_feed(${userId}::integer)`;
        return res.status(200).send(allPosts);
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
/**
 * Creates a new like for the specified post.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
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
/**
 * Deletes the like for the specified post.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
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
/**
 * Checks if the user has liked the specified post.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
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
/**
 * Creates a new comment for the specified post.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
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
/**
 * Retrieves a list of comments for the specified post.
 *
 * @param {Request} req - The incoming request.
 * @param {Response} res - The outgoing response.
 */
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
const removeThisImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let { postId, mediaUrls } = req.body;
    mediaUrls = JSON.parse(mediaUrls);
    const deleteApiCalls = [];
    for (let media of mediaUrls) {
        const fileName = media.split("posts/")[1];
        console.log("Filename:", fileName);
        const deleteFromdb = prisma.post_media.deleteMany({
            where: {
                post_id: parseInt(postId, 10),
                media_url: media,
                user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1,
            },
        });
        const deleteFromMinIO = (0, minio_service_1.deleteFile)(fileName);
        deleteApiCalls.push(deleteFromdb);
        deleteApiCalls.push(deleteFromMinIO);
    }
    try {
        const response = yield Promise.all(deleteApiCalls);
        console.log("delete response : ", response);
        return res.status(200).send(true);
    }
    catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});
exports.removeThisImage = removeThisImage;
