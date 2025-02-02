import Stream, { Channel, StreamConfig, StreamQueue } from "./stream.service";
const amqplib = require("amqplib");

export default class RabbitMQStream extends Stream {
  constructor(config: StreamConfig) {
    super(config);
  }

  async publishMessage(channel: string, message: any): Promise<any> {
    return Promise.resolve();
  }

  //ssds
  consumeMessage(
    channel: string,
    callback: (message: any) => void
  ): Promise<any> {
    return Promise.resolve();
  }
}
