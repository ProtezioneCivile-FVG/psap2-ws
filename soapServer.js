//const http = require('http');
const soap = require('soap');
const express = require('express');
const fs = require('fs');

const Options = require('./Options').Options;

const CardHandler = require('./CardHandler.js');
let _handler = CardHandler.init(Options.handler);

const soap_opts = Options.soap || {};
const web_opts = Options.web || { port: 8001 };

let wsdl = '';
let soap_service = require('./soap/services.js').PSAP2_Service;

try {
	console.log('Loading wsdl definition from %s', soap_opts.wsdl );
	wsdl = fs.readFileSync(soap_opts.wsdl, 'utf8');
}
catch( err ) {
	console.error('\tfailed');
	process.exit(1);
}


var app = express();
//body parser middleware are supported (optional)
// app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));
app.use(express.static('public'));

app.get('/api/card/:id', async ( req, reply ) => {

	let id = req.params.id;

	try {
		let card = await _handler.getCardById( id );
		reply.json( card );
	}
	catch( err ) {
		reply.json( { error: err.toString() } );
	}
});	

app.get('/api/card/cid/:cid', async ( req, reply ) => {

	let cid = req.params.cid;

	try {
		let cards = await _handler.getCardsByCID( cid );
		reply.json( cards );
	}
	catch( err ) {
		reply.json( { error: err.toString() } );
	}
});


app.listen( web_opts.port, function(){

	//soap.log = function(msg) { console.log( message ) ; };
	soap.listen(app, '/Nue_Services/EntiService', soap_service, wsdl, function() {
		console.log('server initialized on port %s', web_opts.port );
	});

});
