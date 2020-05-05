var Options = {
	store: {
		db: {
			user: '',
			password: '',
			server: 'xxx.protezionecivile.fvg.it', // You can use 'localhost\\instance' to connect to named instance
			database: 'yyy',
			stream: true,
			options: {
				//encrypt: true // Use this if you're on Windows Azure
			}
		}
	},
	web: {
		port: 3000
	}
};

exports.Options = Options;
