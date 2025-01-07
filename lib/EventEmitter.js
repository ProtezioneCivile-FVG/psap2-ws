class EventEmitter {
	
	on( event_name, callback ) {
		if( typeof(callback) != 'function' )
		return false;
		
		if( !this.callbacks ) {
			this.callbacks = {};
		}

		this.callbacks[event_name] = callback;
		return this;
	}

	emit( event_name, payload ) {
		if(!this.callbacks) return false;

		const callback = this.callbacks[event_name];
		if(!callback)
			return false;
		
		try {	
			return callback(payload);
		}
		catch( err ) {
			console.error( err );
			return false;
		}
	}
}

module.exports = EventEmitter;