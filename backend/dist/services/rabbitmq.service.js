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
const stream_service_1 = __importDefault(require("./stream.service"));
const amqplib = require("amqplib");
class RabbitMQStream extends stream_service_1.default {
    constructor(config) {
        super(config);
    }
    publishMessage(channel, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve();
        });
    }
    consumeMessage(channel, callback) {
        return Promise.resolve();
    }
}
exports.default = RabbitMQStream;
