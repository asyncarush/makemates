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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.getUserData = getUserData;
exports.updateUserInfo = updateUserInfo;
exports.followUser = followUser;
exports.unfollowUser = unfollowUser;
exports.getFriendList = getFriendList;
exports.setProfilePic = setProfilePic;
exports.logoutUser = logoutUser;
const validate_js_1 = require("../utils/validate.js");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
// Login Function
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = (0, validate_js_1.validateUser)(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        try {
            const user = yield prisma.users.findUnique({
                where: { email: req.body.email },
                select: { id: true, password: true },
            });
            if (!user)
                return res.status(400).send("Email id not found");
            const valid = yield bcrypt_1.default.compare(req.body.password, user.password);
            if (valid) {
                const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_PRIVATE_KEY, { expiresIn: "24hr" });
                return res
                    .cookie("x-auth-token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                })
                    .status(200)
                    .send({ id: user.id });
            }
            else {
                return res.status(401).send("Incorrect Password");
            }
        }
        catch (err) {
            return res.status(500).send("An error occurred during login.");
        }
    });
}
// Register Function
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = (0, validate_js_1.validateNewUser)(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        try {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hash = yield bcrypt_1.default.hash(req.body.password, salt);
            const newUser = yield prisma.users.create({
                data: {
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    gender: req.body.gender,
                    dob: new Date(`${req.body.year}-${req.body.month}-${req.body.day}`),
                },
            });
            const token = jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.JWT_PRIVATE_KEY, { expiresIn: "24hr" });
            return res
                .cookie("x-auth-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            })
                .status(200)
                .send({ id: newUser.id });
        }
        catch (err) {
            return res.status(500).send("An error occurred during registration.");
        }
    });
}
// Get User Data
function getUserData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1;
        try {
            const user = yield prisma.users.findUnique({
                where: { id },
                include: {
                    profileimages: true,
                },
            });
            if (!user)
                return res.status(404).send("User not found");
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                image_url: user.profileimages.length > 0 ? user.profileimages[0].image_url : null,
                password: "************",
            };
            return res.status(200).send(userData);
        }
        catch (err) {
            return res.status(500).send("An error occurred while fetching user data.");
        }
    });
}
// Update User Info
function updateUserInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1;
        const { key, value } = req.body;
        try {
            switch (key) {
                case "name":
                case "email":
                case "mobile_number":
                case "city":
                case "state":
                case "country":
                    yield prisma.users.update({
                        where: { id },
                        data: { [key]: value },
                    });
                    return res
                        .status(200)
                        .send(`${key.charAt(0).toUpperCase() + key.slice(1)} updated Successfully.`);
                case "password":
                    const salt = yield bcrypt_1.default.genSalt(10);
                    const hash = yield bcrypt_1.default.hash(value, salt);
                    yield prisma.users.update({
                        where: { id },
                        data: { password: hash },
                    });
                    return res.status(200).send("Password updated Successfully.");
                case "birthday":
                    yield prisma.users.update({
                        where: { id },
                        data: { dob: new Date(value) }, // Assuming value is in YYYY-MM-DD format
                    });
                    return res.status(200).send("Birthday updated Successfully.");
                default:
                    return res.status(400).send("Invalid update key.");
            }
        }
        catch (err) {
            return res
                .status(500)
                .send("An error occurred while updating user information.");
        }
    });
}
// Follow User
function followUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1;
        const { friendId } = req.body;
        try {
            yield prisma.relationships.create({
                data: {
                    follow_id: friendId,
                    follower_id: id,
                },
            });
            return res.status(200).send("Followed Successfully.");
        }
        catch (err) {
            return res.status(500).send("An error occurred while following user.");
        }
    });
}
// Unfollow User
function unfollowUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1;
        const { friendId } = req.body;
        try {
            yield prisma.relationships.deleteMany({
                where: {
                    follow_id: friendId,
                    follower_id: id,
                },
            });
            return res.status(200).send("Unfollowed Successfully.");
        }
        catch (err) {
            return res.status(500).send("An error occurred while unfollowing user.");
        }
    });
}
// Get Friend List
function getFriendList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1;
        try {
            const relationships = yield prisma.relationships.findMany({
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
                profileImage: rel.users_relationships_follow_idTousers.profileimages.length > 0
                    ? rel.users_relationships_follow_idTousers.profileimages[0].image_url
                    : null,
            }));
            return res.status(200).send(friendList);
        }
        catch (err) {
            return res
                .status(500)
                .send("An error occurred while fetching friend list.");
        }
    });
}
// Set Profile Picture
function setProfilePic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || -1;
        const { profileImgUrl } = req.body;
        try {
            // Create a new profile image record
            const profileImage = yield prisma.profileimages.create({
                data: {
                    user_id: id,
                    image_url: profileImgUrl,
                    currentImg: true,
                },
            });
            // Update the user's profile image reference
            yield prisma.users.update({
                where: { id },
                data: { img: profileImage.id },
            });
            return res.status(200).send("Profile picture updated successfully.");
        }
        catch (err) {
            return res
                .status(500)
                .send("An error occurred while setting profile picture.");
        }
    });
}
// Logout User
function logoutUser(req, res) {
    return res
        .clearCookie("x-auth-token")
        .status(200)
        .send("Logout Successfully.");
}
