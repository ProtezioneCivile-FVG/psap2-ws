var Options = {
	web: {
		port: 8001,
		trace: false // put to true for SOAP logging
	},
	soap: {
		wsdl: __dirname + '/soap/psap2.wsdl'
	},
	store: {
		// persistent store for contact cards
		type: 'sqlite',
		params: {
			filename: __dirname + '/contactcards.sqlite3'
		}
	},
	mq: {
		disabled: false,
		// Do not put credentials under version control !
		url: 'amqp://user:password@psap2mq.protezionecivile.fvg.it/psap2',
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
