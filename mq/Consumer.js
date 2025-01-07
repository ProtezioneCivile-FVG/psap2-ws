const amqplib = require('amqplib');

const default_exchange = {
	type: 'fanout',
	name: 'main',
	options: {durable: true }
};

const default_queue = {
	name: '',
	options: {}
};

class Consumer {

	constructor(args) {
		const opts = args || {};

		this.url = opts.url;
		this.cnn = null;
		this.channel = null;
		this.exchange = opts.exchange || {};
		this.queue = Object.assign( {}, default_queue, opts.queue || {} );
	}

	async open() {
		if(!this.url)
			throw 'MQ.open: url not configured';
	
		if( this.cnn == null ) {
			this.cnn = await amqplib.connect(this.url);
		}
	
		if( this.channel == null )
			this.channel = await this.cnn.createChannel();

		const qname = this.queue.name || default_queue.name;
		let q = await this.channel.assertQueue( qname, this.queue.options );

		if( this.exchange != null ) { // if exchange specified then assert exchange and bind queue
			const ename = this.exchange.name || default_exchange.name;
			const type = this.exchange.type || default_exchange.type;
			await this.channel.assertExchange( ename, type, this.exchange.options );

			await this.channel.bindQueue( qname, ename, this.queue.pattern || '' );
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

	consume( callback ) {
		if( this.channel == null )
			throw 'MQ.consume: channel not yet opened'

		if( typeof(callback) != 'function' )
			throw 'MQ.consume: no callback specified';

		return this.channel.consume( this.queue.name ||default_queue.name, callback );
	}

	ack( msg ) {
		this.channel.ack(msg);
	}
}

exports.Consumer = Consumer;


