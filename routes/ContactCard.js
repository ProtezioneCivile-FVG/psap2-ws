const store = require('../store');

let db = new store.Store();


async function test() {
	debugger;
	let r = await db.setupDB();
}

/*
let options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    decodeHTMLchar: false,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
};
*/
//const xml_parser = require('fastify-xml-body-parser', options);
const xml_parser = require('fastify-xml-body-parser');

function route (fastify, opts, next) {

	fastify.register( xml_parser );

	db.setupDB().then( () => console.log('db setted up') );

	fastify.get('/ccard/:id', async (req, reply) => {

		let id = req.params.id;

		try {
			let data = await db.getCardById( id );
			let card = {
				id: data.id,
				cid: data.cid,
				created_dt: data.created_dt,
				data: JSON.parse( data.json )
			};
			reply.send( card );
		}
		catch( err ) {
			reply.send( { error: err.toString() } );
		}
	});

	fastify.get('/ccard/cid/:cid', async (req, reply) => {

		let cid = req.params.cid;

		try {
			let data = await db.getCardByCID( cid );
			let card = {
				id: data.id,
				cid: data.cid,
				created_dt: data.created_dt,
				data: JSON.parse( data.json )
			};
			reply.send( card );
		}
		catch( err ) {
			reply.send( { error: err.toString() } );
		}
	});

	fastify.post('/ccard', async (req, reply) => {

		let card = req.body.ContactCard;
		let json = JSON.stringify( card );
		//console.log( JSON.stringify(req.body, null, '\n' ) );

		let ok = await db.newCard( {
			id: card.ID,
			cid: card.CID.toString(),
			created_dt: card.CreateDate,
			json: json,
			xml: ''
		} );
		reply.send( card );
	});

	next();
}

module.exports = route;
  