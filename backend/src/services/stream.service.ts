export interface StreamChannel {
  request: any;
  response: any;
}

export interface Channel {
  request: any;
  response: any;
}

export interface StreamConfig {
  readonly url: string;
  readonly credentials?: {
    readonly username?: string;
    readonly password?: string;
  };
  readonly options?: Record<string, any>;
}

export interface StreamQueue {
  request: string;
  response: string;
}

export default abstract class Stream {
  protected config: StreamConfig;
  protected queues: StreamQueue;
  protected channel: Promise<Channel>;
  protected conn: any;

  constructor(config: StreamConfig) {
    this.config = config;
    this.queues = this.initQueue();
    this.channel = this.createChannel();
    this.conn = this.connect();
  }

  protected initQueue = (): StreamQueue => {
    return {
      request: "request-queue",
      response: "request-queue",
    };
  };

  //   connect = async () => {
  //     await amqplib.connect("amqp://user:RkrLMHwnOcsaf7eA@192.168.49.2:31521");
  //   };

  protected async connect(): Promise<void> {
    const { url, credentials } = this.config;
  }

  protected async createChannel(): Promise<Channel> {
    if (!this.conn) {
      throw new Error(
        "Connection has not been established. You can Coonect via connect() method."
      );
    }
    const request = await this.conn.createChannel();
    const response = await this.conn.createChannel();
    return { request, response };
  }

  abstract publishMessage(channel: string, message: any): Promise<any>;
  abstract consumeMessage(
    channel: string,
    callback: (message: any) => void
  ): Promise<any>;
}
