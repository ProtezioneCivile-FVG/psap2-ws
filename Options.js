// SPDX-License-Identifier: MIT

var Options = {
	web: {
		port: process.env.WS_PORT ?? 8001,
		trace: true // put to true for SOAP logging
	},
	soap: {
		host: process.env.SOAP_HOST ?? 'localhost',
		port: process.env.WS_PORT ?? 8001,
		wsdl: __dirname + '/soap/psap2.wsdl'
	},
	store: {
		// persistent store for contact cards
		type: 'sqlite',
		params: {
			filename: (process.env.SQLITE_STORAGE ?? __dirname) + '/contactcards.sqlite3'
		}
	},
	mq: {
		disabled: false,
		url: `amqp://${process.env.MQ_CREDENTIALS}@${process.env.MQ_HOST}/${process.env.MQ_VHOST ?? ''}`,
		// Fanout exchange for multiple clients
		exchange: {
			name: 'cards',
			type: 'fanout',
			options: { durable: true }
		},
		// For testing purposes
		queue: {
			name: 'sor'
		}
	}
};

exports.Options = Options;
