const { MessageQueue } = require('../mq');
const opts = require('../Options.js').Options;

console.log( 'Creating mq listener...');
let mq = new MessageQueue(opts.mq);

try {
	console.log('Start listening.');
	mq.consume( msg => {
		// debugger
		let json = JSON.parse(msg.content.toString());
		console.log('got message from queue:\n%s\n', JSON.stringify(json, null, 2));
	});
	// console.log('End listening');
}
catch(err) {
	console.error( 'Something went wrong: %s', err );
}