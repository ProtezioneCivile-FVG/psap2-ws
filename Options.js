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
	}
};

exports.Options = Options;
