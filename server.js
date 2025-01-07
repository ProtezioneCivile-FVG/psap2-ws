const soap = require('soap');
const express = require('express');
const fs = require('fs');
require('dotenv').config({path: __dirname + '/.env'});

const Options = require('./Options').Options;
const DataStore = require('./DataStore.js');
const soap_service = require('./soap/PSAP2_Service.js');
const { Producer } = require('./mq/Producer.js');

const default_port = 8001;

const web_opts = { port: default_port, trace: false, ... (Options.web ?? {}) };
const soap_opts = { host: 'localhost', port: default_port, ...(Options.soap ?? {}) };
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
		const wsdl_vars = [
			{ key: 'SOAP_HOST', value: soap_opts.host },
			{ key: 'SOAP_PORT', value: web_opts.port },
		]
		wsdl_vars.forEach( item => wsdl = wsdl.replaceAll(`{{${item.key}}}`, item.value ) );
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

	let _mq = null;
	if( mq_opts.disabled !== true ) {
		_mq = new Producer(mq_opts);
		console.log('Starting Message queue channel on %s/%s', process.env.MQ_HOST, process.env.MQ_VHOST ?? '');
		await _mq.open();
		console.log('\tdone.');
	}

	// Setting up actions on cards arrival and some error handling
	soap_service
	.on( 'card-received', async ( card_record ) => {
		try {
			console.log( 'Card received.' );
			let ok = await _data_store.addCard( card_record );
			console.log( 'Card record stored. Res: %s', ok );
		}
		catch( err ) {
			console.error( 'Error in saving card record:\n%s', err );
			return false;
		}

		if( _mq != null ) {
			try {
				console.log( 'Publishing card to message queue.' );
				const res = await _mq.publish( card_record.json );
				console.log( 'Card published. Res: %s', res );
			}
			catch( err ) {
				console.error( 'Error in publishing card:\n%s', err );
				return false;
			}
		}

		return true;
	})
	.on( 'error', (err) => {
		console.error( 'Error in soap service:\n%s', err );
	})
	.on( 'invalid-xml-card', (xmlData) => {
		console.log( 'Invalid XML received: \n---\n%s\n---\n', xmlData );
	});


	console.log('Starting web server');
	const path = '/Nue_Services/EntiService';
	const app = express();
	const server = app.listen( web_opts.port, function(){
		console.log('\tdone.\nStarting web service');
		let ws = soap.listen(app, path, soap_service, wsdl, function() {
			console.log('\tdone\nWeb Server listening on %s:%s', path, web_opts.port );
		});
		if( web_opts.trace === true ) {
			console.log('*** TRACE ENABLED ****');
			ws.log = function(type, data, req) {
				// type is 'received', 'replied', 'info' or 'error'
				// console.log("*** %s\n%s\n%s", type, data, req);
				console.log("*** %s\n%s", type, data);
			};
		}
	});

	process.on('SIGTERM', () => {
		try {
			console.debug('SIGTERM signal received: closing HTTP server');
			server.close(() => {
			  console.debug('HTTP server closed')
			});
			
			if( _mq ) {
				console.debug('Closing message queue');
				_mq.close().then(
					() => {
						_mq = null;
						console.debug('Message queue closed');
					},
					(err) => {
						_mq = null;
						console.error('Error closing message queue channel: %s', err );
					}
				);
			}
		}
		catch( err ) {
			console.error('ERROR closing application: %s', err );
			process.exit();
		}
	})	
}

try {
	run();
}
catch( err ) {
	console.error( err );
	debugger;
}
