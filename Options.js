var Options = {
	web: {
		port: 8001
	},
	soap: {
		wsdl: './soap/psap2.wsdl',
		//service: './soap/services.js'
	},
	store: {
		type: 'sqlite',
		params: {
			filename: './contactcards.sqlite3'
			/*
			user: '',
			password: '',
			server: 'xxx.protezionecivile.fvg.it', // You can use 'localhost\\instance' to connect to named instance
			database: 'yyy',
			stream: true,
			options: {
				//encrypt: true // Use this if you're on Windows Azure
			}
			*/
		}
	},
	mq: {
		// disabled: false,
		url: 'amqp://psap2:psap2@172.18.35.42/psap2',
		exchange: {
			name: 'cards',
			type: 'fanout',
			options: { durable: true }
		},
		queue: {
			name: 'sor'
		},
		disabled: false
	}
};

exports.Options = Options;
