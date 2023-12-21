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
			let content = msg.content.toString();
			let json = null;
			try {
				json = JSON.parse(content);
			}
			catch( err ) {
				console.error(err);
			}
			if( json )
				console.log('got message from queue:\n%s\n', JSON.stringify(json, null, 2));
			else
				console.log('got non json message:\n%s\n', content );
			mq.ack(msg);
		});
		// console.log('End listening');
	}
	catch(err) {
		console.error( 'Something went wrong: %s', err );
	}

}

run();