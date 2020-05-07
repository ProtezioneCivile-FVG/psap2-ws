const store = require('../store/sqlite');
const CardHandler = require('../CardHandler.js');

const xml_parser = require('fastify-xml-body-parser');

function route (fastify, opts, next) {

	fastify.register( xml_parser );

	let _handler = CardHandler.get();
	if( !_handler ) {
		console.error( 'CardHandler not yet inizialized, aborting route setup');
		next();
	}

	fastify.get('/ccard/:id', async (req, reply) => {

		let id = req.params.id;

		try {
			let card = await _handler.getCardById( id );
			reply.send( card );
		}
		catch( err ) {
			reply.send( { error: err.toString() } );
		}
	});

	fastify.get('/ccard/cid/:cid', async (req, reply) => {

		let cid = req.params.cid;

		try {
			let cards = await _handler.getCardsByCID( cid );
			reply.send( cards );
		}
		catch( err ) {
			reply.send( { error: err.toString() } );
		}
	});

	fastify.post('/ccard', async (req, reply) => {

		let card = req.body.ContactCard;
		let json = JSON.stringify( card );
		//console.log( JSON.stringify(req.body, null, '\n' ) );

		let ok = await _handler.addCard({
			id: card.ID,
			cid: card.CID.toString(),
			created_dt: card.CreateDate,
			json: json,
			xml: ''
		} );
		reply.send( ok );
	});

	next();
}

module.exports = route;
  