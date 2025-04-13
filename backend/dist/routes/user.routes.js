"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// Test route for cookie debugging
router.get("/test-cookie", (req, res) => {
    // Log incoming cookies
    console.log("Test route - cookies received:", req.cookies);
    // Set a test cookie
    res.cookie("test-cookie", "test-value", {
        httpOnly: false, // Make it visible to JavaScript
        secure: false,
        sameSite: "lax",
        path: "/",
    });
    return res.status(200).json({
        message: "Test cookie set",
        receivedCookies: req.cookies,
    });
});
// Test route for environment variables and JWT key
router.get("/debug-env", (req, res) => {
    return res.status(200).json({
        jwtKeyDefined: Boolean(process.env.JWT_PRIVATE_KEY),
        nodeEnv: process.env.NODE_ENV || "not set",
        cookieParser: Boolean(req.cookies),
    });
});
router.post("/register", user_controller_1.register);
router.post("/login", user_controller_1.login);
router.get("/logout", auth_1.default, user_controller_1.logoutUser);
router.post("/update", auth_1.default, user_controller_1.updateUserInfo);
router.post("/follow", auth_1.default, user_controller_1.followUser);
router.post("/unfollow", auth_1.default, user_controller_1.unfollowUser);
router.get("/friendList", auth_1.default, user_controller_1.getFriendList);
router.post("/setProfilePic", auth_1.default, user_controller_1.setProfilePic);
router.get("/me", auth_1.default, user_controller_1.getUserData);
exports.default = router;
