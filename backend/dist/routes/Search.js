"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Search_1 = require("../controller/Search");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post("/profile", auth_1.default, Search_1.getUserProfile);
router.post("/user", auth_1.default, Search_1.searchUser);
router.post("/checkFollowed", auth_1.default, Search_1.checkFollowed);
exports.default = router;
