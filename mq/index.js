const amqplib = require('amqplib');

class MessageQueue {
	constructor(args) {
		const opts = args || {};

		this.url = opts.url;
		this.queue = opts.queue;
	}


	async send(msg) {
		if(!this.url || !this.queue) {
			throw 'Queue or url not configured';
		}

		let conn = await amqplib.connect(this.url);

		const ch2 = await conn.createChannel();
		return ch2.sendToQueue(this.queue, Buffer.from(msg));
	}

	async consume( callback ) {
		if(!this.url || !this.queue) {
			throw 'Queue or url not configured for MQ::consume';
		}
		if( typeof(callback) != 'function') {
			throw 'No callback specified for MQ::consume';
		}

		let conn = await amqplib.connect(this.url);
		const ch1 = await conn.createChannel();
		await ch1.assertQueue(this.queue);

		// Listener
		ch1.consume(this.queue, (msg) => {
			if (msg !== null) {
				console.log('Received:', msg.content.toString());
				ch1.ack(msg);
				callback(msg);
			} else {
				console.log('Consumer cancelled by server');
			}
		});
		
	}
}



exports.MessageQueue = MessageQueue;


