const sqlite3 = require('sqlite3').verbose();


//------------ UTILS
const moment = require('moment'); // TODO: change datetime library to another one
function dateTimeFormat( dt ) {
    return moment(dt).format('YYYY-MM-DD HH:mm:ss.SSS');
}

function dateFormat( dt ) {
    return moment(dt).format('YYYY-MM-DD');
}

function dtParse( str ) {
    return moment( str ).toDate();
}

function quote( s ) {
    return "'" + s.replace(/'/g,"") + "'";
}

function bool( b, def_value ) {
    return (typeof(b) == 'boolean' ? b : def_value);
}
//------------------


function Store(opts) {
    this.db = null;
    this.opts = opts || {};

    this.readonly = bool( this.opts.readonly, false );
    this.dbname = this.opts.filename || './ccards.sqlite3';
    this.log_sql = bool(this.opts.log_sql, false);
}

Store.prototype.sql_run = async function(sql, params) {
    if( this.db == null ) return Promise.reject( new Error('DB not initialized'));

    let me = this;

    return new Promise( (resolve, reject) => {
        if( me.log_sql ) console.log( sql );
        me.db.run( sql, params || [], function(err) {
            //console.log("%s< %s", sqlid, err)
            if( err )
                reject( err );
            else
                resolve(this);
        });
    });
};

Store.prototype.sql_get = async function(sql, params) {
    if( this.db == null ) return Promise.reject( new Error('DB not initialized'));

    return new Promise( (resolve,reject) => {
        if( this.log_sql ) console.log( sql );
        this.db.get( sql, params, (err, row) =>  {
            if( err )
                reject(err);
            else
                resolve( row || {} );
        });
    });
};

Store.prototype.sql_insert = async function( obj ) {
    let fields = Object.keys(obj);
    let values = Object.values(obj);

    let sql = "INSERT INTO cards (" + fields.join(',') + ") VALUES (" + values.map( x=> '?' ).join(',') + ")";
    return this.sql_run( sql, values )
        .then( (res) => ({rowid: res.lastID, changes: res.changes }) );;
};

Store.prototype.sql_update = async function( obj, where ) {
    let fields = Object.keys(obj);
    let values = Object.values(obj);

    let s = fields.map( x => x + '=?' );
    let sql = "UPDATE cards SET " + s.join(',');
    if( where ) {
        if( typeof(where) == 'string' )
            sql += ' WHERE ' + where;
        else if( where && where.params && where.condition ) {
            sql += ' WHERE ' + where.condition;
            values = values.concat(where.params);
        }
    }

    return this.sql_run( sql, values ).then( (res) => ({changes: res.changes }) );;
};

Store.prototype.sql_read = async function( sql, params, cbk ) {
    if( this.db == null ) return Promise.reject( new Error('DB not initialized'));
    if( typeof(params) == 'function' && !cbk ) {
        cbk = params;
        params = [];
    }
    else if( cbk && typeof(cbk) != 'function' ) {
        return Promise.reject( new Error('Callback is not a function'));
    }

    return new Promise( (resolve,reject) => {
        if( this.log_sql ) console.log( sql );
        let rowcount = 0;
        this.db.each( sql, params, (err, row) =>  {
            if( err ) {
                reject(err);
                return;
            }

            rowcount++;
            cbk(row, rowcount);
        }, (err, count) => {
            // End of rows callback
            if( err )
                reject( err );
            else
                resolve(count);
        });
    });
};

Store.prototype.sql_read_all = async function( sql, params ) {
    if( this.db == null ) return Promise.reject( new Error('DB not initialized'));

    return new Promise( (resolve,reject) => {
        if( this.log_sql ) console.log( sql );
        let rowcount = 0;
        this.db.all( sql, params || [], (err, rows) =>  {
            if( err ) {
                reject(err);
                return;
            }

            resolve(rows);
        });
    });
};

Store.prototype.setupDB = async function() {
	if( this.readonly ) return Promise.resolve();

	const cards_fields = [
		'id INTEGER NOT NULL',
		'cid TEXT',
		'created_dt TEXT',
		'received_dt TEXT',
		'json TEXT',
		'xml TEXT'
	];

	let sql = [
		"CREATE TABLE IF NOT EXISTS cards (" + cards_fields.join(',') + ");",
		// indexes
		'CREATE INDEX IF NOT EXISTS ix_id ON cards ( id )',
		'CREATE INDEX IF NOT EXISTS ix_cid ON cards ( cid )',
		'CREATE INDEX IF NOT EXISTS ix_create_dt ON cards ( created_dt )',
		'CREATE INDEX IF NOT EXISTS ix_received_dt ON cards ( received_dt )',
		// views
		//stats_view_sql,
	];

	let me = this;
	let p = this.begin().then( async function() {
		let res;
		try {
			for( let i=0; i<sql.length; i++ ) {
				let cmd = sql[i];
				await me.sql_run( cmd );
			}

			return Promise.resolve();
		}
		catch( e ) {
			return Promise.reject( e );
		}
	});
};

Store.prototype.begin = async function() {
    if( this.db != null )
        return Promise.resolve();

    let dbase_url = this.dbname;
    let mode = this.readonly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
    let me = this;
    return new Promise( (resolve, reject) => {
        me.db = new sqlite3.Database( dbase_url, mode, (err) => {
            if( err ) {
                me.db = null;
                reject(err);
                return;
            }
            resolve();
        });
    });
};

Store.prototype.end = async function() {
    if( this.db == null )
        return Promise.resolve();

    let me = this;

    return new Promise( (resolve, reject) => {
        me.db.close( (err) => {
            me.db = null;
            if( err )
                reject(err);
            else
                resolve();
        });
    });
};

Store.prototype.startBatch = async function() {
    return this.sql_run( 'BEGIN TRANSACTION' );
};

Store.prototype.endBatch = async function() {
    return this.sql_run( 'COMMIT' );
};

Store.prototype.getCardById = async function( id ) {
	// WARNING: the same IDs may be reused in the same day...
    let sql = "SELECT * FROM cards WHERE id = ?";

    return this.sql_get( sql, [id] )
        .then( (obj) => obj && obj.id ? obj : null );
};

Store.prototype.getCardByRowId = async function( id ) {
	// WARNING: the same IDs may be reused in the same day...
	let sql = "SELECT * FROM cards WHERE id = ?";

	return this.sql_get( sql, [id] );
};

Store.prototype.getCardByCID = async function( cid ) {
	// WARNING: the same IDs may be reused in the same day...
	let sql = "SELECT * FROM cards WHERE cid = ?";

	return this.sql_get( sql, [cid] );
};

Store.prototype.newCard = async function( c ) {

    let v = {
        id: c.id,
        cid: c.cid,
        created_dt: dateTimeFormat(c.created_dt),
        received_dt: dateTimeFormat(new Date()),
		json: c.json,
		xml: c.xml
    };

    return this.sql_insert( v );
};

exports.Store = Store;
