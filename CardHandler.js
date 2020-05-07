//const store = require('./store/sqlite');


function CardHandler( options ){
	this.opts = options || {};
	let store_opts = this.opts.store || {};
	let store = require('./store/' + store_opts.type || 'sqlite' );
	this.db = new store.Store(store_opts.params);
	this.initialized = false;
}

CardHandler.prototype.init = function() {
	if( this.initialized ) return Promise.resolve(true);
	let me = this;
	return this.db.setupDB().then( function() {
		me.initialized = true;
		console.log('db setted up');
		return true;
	},
	function( err ) {
		console.err( 'db setup failed: %s', err );
		return false;
	});
};

CardHandler.prototype.dispose = function() {
	this.db.end();
};

CardHandler.prototype.getCardById = async function( id ) {

	let data = await this.db.getCardById( id );
	let card = {
		id: data.id,
		cid: data.cid,
		created_dt: data.created_dt,
		data: JSON.parse( data.json )
	};

	return card;

}

CardHandler.prototype.getCardsByCID = async function( id ) {

	let data = await this.db.getCardByCID( id );
	let card = {
		id: data.id,
		cid: data.cid,
		created_dt: data.created_dt,
		data: JSON.parse( data.json )
	};

	return [ card ];
}

CardHandler.prototype.addCard = async function( card ) {
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

let Singleton = {
	_instance: null,
	init: function(options) {
		if( !Singleton._instance ) {
			Singleton._instance = new CardHandler(options);
			Singleton._instance.init();
		}
		return Singleton._instance;
	},
	get: function() {
		return Singleton._instance;
	},
	dispose: function() {
		_instance.dispose();
		Singleton._instance = null;
	}
}

module.exports = Singleton;
  