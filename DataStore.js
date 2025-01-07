/*
	Save the card in a persistent store
	The implementations depends on the type of engine choosed in Options.js
	At the moment only sqlite is available.
	To implement other engines put a directory under the store folder with the type name and an index.js main file

	The engine must implement the following methods:

	<Constructor>( params from options.store.params )

	setupDB() // promise (no return code)

	end()

	getCardById( id )

	getCardByCID( cid )

	newCard( card )	// Save the card into the store
		card is : {
			id: ID,
			cid: CID,
			created_dt: CreateDate,
			json: json, // json converted card's data
			xml: xml // raw card data
		}
*/

function DataStore( options ){
	const opts = options || {};
	let store = require('./store/' + opts.type || 'sqlite' );
	this.db = new store.Store(opts.params);
	this.initialized = false;
}

DataStore.prototype.init = function() {
	if( this.initialized ) return Promise.resolve(true);
	let me = this;
	return this.db.setupDB().then( function() {
		me.initialized = true;
		return true;
	});
};

DataStore.prototype.dispose = function() {
	this.db.end();
};

DataStore.prototype.getCardById = async function( id ) {

	let data = await this.db.getCardById( id );
	let card = {
		id: data.id,
		cid: data.cid,
		created_dt: data.created_dt,
		data: JSON.parse( data.json )
	};

	return card;

}

DataStore.prototype.getCardsByCID = async function( id ) {

	let data = await this.db.getCardByCID( id );
	let card = {
		id: data.id,
		cid: data.cid,
		created_dt: data.created_dt,
		data: JSON.parse( data.json )
	};

	return [ card ];
}

DataStore.prototype.addCard = async function( card ) {
	// card is : {
	// 	id: ID,
	// 	cid: CID,
	// 	created_dt: CreateDate,
	// 	json: json,
	// 	xml: xml
	// }
	if( !card ) return false;

	let res = await this.db.newCard( card );
	if( res && res.changes > 0 )
		return true;
	else
		return false;
}

module.exports = DataStore;
  