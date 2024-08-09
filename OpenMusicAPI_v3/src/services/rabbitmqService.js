const amqp = require('amqplib');

class RabbitMQService {
  constructor() {
    this._channel = null;
  }

  async init() {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    this._channel = await connection.createChannel();
  }

  async sendMessage(queue, message) {
    if (!this._channel) {
      await this.init();
    }
    await this._channel.assertQueue(queue, { durable: true });
    this._channel.sendToQueue(queue, Buffer.from(message));
  }
}

module.exports = RabbitMQService;
