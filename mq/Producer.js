// SPDX-License-Identifier: MIT

const amqplib = require('amqplib');

const default_exchange = {
	type: 'fanout',
	name: 'main',
	options: {durable: true }
};

class Producer {

	constructor(args) {
		const opts = args || {};

		this.url = opts.url;
		this.cnn = null;
		this.channel = null;
		this.exchange = Object.assign( {}, default_exchange, opts.exchange || {} );
	}

	async open() {
		if(!this.url)
			throw 'MQ.open: url not configured';
	
		if( this.cnn == null ) {
			this.cnn = await amqplib.connect(this.url);
		}
	
		if( this.channel == null ) {
			this.channel = await this.cnn.createChannel();
			const name = this.exchange.name || default_exchange.name;
			const type = this.exchange.type || default_exchange.type;
			await this.channel.assertExchange( name, type, this.exchange.options );
		}
	}

	async close() {
		if( this.channel != null ) {
			await this.channel.close();
			this.channel = null;
		}

		if( this.cnn != null ) {
			await this.cnn.close();
			this.cnn = null;
		}
	}

	async publish( msg ) {
		if( this.channel == null )
			throw 'MQ.publish: channel not yet opened'

		return this.channel.publish(this.exchange.name || default_exchange.name, '', Buffer.from(msg));
	}
}

exports.Producer = Producer;


