/*
	Send a json contact card directly to the message queue.
	Used to test the MQ

	Syntax: node mqSend.js contact_card_id

	The file read is this-folder/{contact_card_id}.json
*/

require('dotenv').config({path: __dirname + '/../.env'});

const { Producer } = require('../mq/Producer.js');
const opts = require('../Options.js').Options;
const fs = require('node:fs');

let args = process.argv.splice(2);
let opt = args[0];

const log_message = (id, msg, title) => {
	if(title)
		console.log(title);
	console.log(msg);
}

const load_message = (id, msg, title) => {
	if(title)
		console.log(title);
	const filename = __dirname + '/' + id + '.json';
	try {
		let sjson = fs.readFileSync(filename);
		return sjson;
	}
	catch(err) {
		console.error(err);
		return null;
	}
}


async function run() {
	try {
		debugger
		console.log( 'Creating mq Producer for %s/%s ...', process.env.MQ_HOST, process.env.MQ_VHOST ?? '');
		let mq = new Producer(opts.mq);
		
		const fileName = opt;
		if(!fileName) {
			console.error( "No file to read: missing argument");
			return;
		}

		console.log('Reading %s...\n', fileName);
		let msg = load_message(fileName);

		if(!msg) {
			console.error("\tfailed");
		}
		else {
			console.log("\tdone");
		}
	
		console.log("Opening message queue");
		await mq.open();
		
		console.log("Sending message");
		const res = await mq.publish( msg );

		console.log('Closing message queue');
		await mq.close();
	}
	catch(err) {
		console.error( 'Something went wrong: %s', err );
	}

}

run();