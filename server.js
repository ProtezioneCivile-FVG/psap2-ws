const soap = require('soap');
const express = require('express');
const fs = require('fs');

const Options = require('./Options').Options;
const DataStore = require('./DataStore.js');
const soap_service = require('./soap/PSAP2_Service.js');
const { MessageQueue } = require('./mq');

const web_opts = Options.web || { port: 8001 };
const soap_opts = Options.soap || {};
const store_opts = Options.store || {};
const mq_opts = Options.mq || {};


function _exit( err ) {
	console.error( err );
	process.exit(1);
}

async function run() {

	console.log('Loading wsdl definition from %s', soap_opts.wsdl );
	let wsdl = '';
	try {
		wsdl = fs.readFileSync(soap_opts.wsdl, 'utf8');
		console.log('\tdone.');
	}
	catch( err ) {
		console.error('\tfailed');
		_exit( err );
	}



	console.log('Opening datastore (type: %s)', store_opts.type );
	let _data_store = null;
	try {
		_data_store = new DataStore( store_opts );
		await _data_store.init();
		console.log('\tdone.');
	}
	catch( err ) {
		console.error('\tfailed');
		_exit( err );
	}

	let _mq = mq_opts.disabled === true ? null : new MessageQueue(mq_opts);

	// Setting up actions on cards arrival and some error handling
	soap_service
	.on( 'card-received', ( card_record ) => {
		_data_store.addCard( card_record ).then( async (ok) => {
			console.log( 'Card record stored. Res: %s', ok );
			if( _mq != null ) {
				try {
					const res = await _mq.send( JSON.stringify(card_record.json) );
				}
				catch( err ) {
					console.error('MessageQueue error: %s', err);
				}
			}
		},
		(err) => {
			console.error( 'Error in saving card record:\n%s', err );
		});
	})
	.on( 'error', (err) => {
		console.err( 'Error in soap service:\n%s', err );
	})
	.on( 'invalid-xml-card', (xmlData) => {
		console.log( 'Invalid XML received: \n---\n%s\n---\n', xmlData );
	});


	console.log('Starting web server');
	const app = express();
	app.listen( web_opts.port, function(){
		console.log('\tdone.\nStarting web service');
		soap.listen(app, '/Nue_Services/EntiService', soap_service, wsdl, function() {
			console.log('\tdone\nWeb Server listening on port %s', web_opts.port );
		});
	});

}

try {
	run();
}
catch( err ) {
	console.error( err );
	debugger;
}