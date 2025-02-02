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
class Stream {
    constructor(config) {
        this.initQueue = () => {
            return {
                request: "request-queue",
                response: "request-queue",
            };
        };
        this.config = config;
        this.queues = this.initQueue();
        this.channel = this.createChannel();
        this.conn = this.connect();
    }
    //   connect = async () => {
    //     await amqplib.connect("amqp://user:RkrLMHwnOcsaf7eA@192.168.49.2:31521");
    //   };
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const { url, credentials } = this.config;
        });
    }
    createChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.conn) {
                throw new Error("Connection has not been established. You can Coonect via connect() method.");
            }
            const request = yield this.conn.createChannel();
            const response = yield this.conn.createChannel();
            return { request, response };
        });
    }
}
exports.default = Stream;
