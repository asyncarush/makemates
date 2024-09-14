"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = validateUser;
exports.validateNewUser = validateNewUser;
const joi_1 = __importDefault(require("joi"));
function validateUser(user) {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().min(5).max(50).required(),
        password: joi_1.default.string().min(5).max(1024).required(),
    });
    return schema.validate(user);
}
function validateNewUser(user) {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(3).max(20).required(),
        email: joi_1.default.string().email().min(5).max(50).required(),
        password: joi_1.default.string().min(5).max(1024).required(),
        day: joi_1.default.string().required(),
        month: joi_1.default.string().required(),
        year: joi_1.default.string().required(),
        gender: joi_1.default.string().required(),
    });
    return schema.validate(user);
}
