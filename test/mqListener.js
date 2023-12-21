const { Consumer } = require('../mq/Consumer.js');
const opts = require('../Options.js').Options;

console.log( 'Creating mq listener...');
let mq = new Consumer(opts.mq);

async function run() {
	try {
		console.log('Start listening.');
	
		await mq.open();

		mq.consume( msg => {
			// debugger
			let json = {message: msg.content.toString()};
			try {
				json = JSON.parse(json.message);
			}
			catch( err ) {
				console.error('Not a json message');
			}
			console.log('got message from queue:\n%s\n', JSON.stringify(json, null, 2));
			mq.ack(msg);
		});
		// console.log('End listening');
	}
	catch(err) {
		console.error( 'Something went wrong: %s', err );
	}

}

run();