/*
	Listen on MQ and print the received json on stdout
	Used to test the MQ

	Syntax: node mqListener.js [-s]

	With the -s options the json is saved to file this-folder/{contact_card_id}.json
*/

require('dotenv').config({path: __dirname + '/../.env'});

const { Consumer } = require('../mq/Consumer.js');
const opts = require('../Options.js').Options;
const fs = require('node:fs');

let args = process.argv.splice(2);
let opt = args[0];

const log_message = (id, msg, title) => {
	if(title)
		console.log(title);
	console.log(msg);
}

const save_message = (id, msg, title) => {
	if(title)
		console.log(title);
	const filename = __dirname + '/' + id + '.json';
	try {
		fs.writeFileSync(filename, msg);
	}
	catch(err) {
			console.error(err);
	}
}

let action = log_message;
if( opt && opt.toLowerCase() == '-s' ) {
	action = save_message;
}


console.log( 'Creating mq listener for %s/%s ...', process.env.MQ_HOST, process.env.MQ_VHOST ?? '');
let mq = new Consumer(opts.mq);

async function run() {
	try {
		console.log('Start listening.');
	
		await mq.open();

		mq.consume( msg => {
			// debugger
			let content = msg.content.toString();
			let json = null;
			let id = null;
			try {
				json = JSON.parse(content);
				id = json.ID;
			}
			catch( err ) {
				console.error(err);
				id = (new Date()).getTime() + 'txt';
			}
			if( json ) {
				action(id, JSON.stringify(json, null, 2), 'got json message from queue');
			}
			else {
				action(id, content, 'got not-json message from queue');
			}
			mq.ack(msg);
		});
		// console.log('End listening');
	}
	catch(err) {
		console.error( 'Something went wrong: %s', err );
	}

}

run();