// const xml_parser = require('fast-xml-parser');
const { XMLParser, XMLValidator } = require('fast-xml-parser');
const EventEmitter = require('../lib/EventEmitter.js')

const _events = new EventEmitter();

const xml_parser = new XMLParser();

// Event Names
const EVENT_RAW_CARD_RECEIVED = "raw-card-received";
const EVENT_INVALID_XML_CARD = "invalid-xml-card";
const EVENT_CARD_RECEIVED = "card-received";
const EVENT_ERROR = 'error';

// http://<ip>:<port>/Nue_Services/EntiService
const PSAP2_Service = {
	on: (name,callback) => _events.on(name,callback),

	Nue_Services: {
		EntiServicePort: {

			GestContatto: function(args) {

				/* args is {
					EnteMittente: string
					ProvinciaMittente: string
					SedeMittente: string

					EnteDestinatario: string
					ProvinciaDestinatario: string
					SedeDestinataria: string

					SchedaContatto: string -> xml of contact card
				}*/
				return new Promise((resolve, reject) => {

					try {
						_events.emit( EVENT_RAW_CARD_RECEIVED, args );

						const parameters = args.parameters || args;
						const data = parameters.SchedaContatto || parameters;

						console.log("Raw soap: (%s) %s\n\n", typeof(data), JSON.stringify(data));

						let xmlData = null;
						if(Array.isArray(data)) {
							let pp = {};
							for( let i=0; i<data.length; i++ ) {
								let it = data[i].item || data[i];
								if( it.key ) {
									pp[it.key] = it.value;
								}
							}
							xmlData = pp.SchedaContatto;
						}

						// Decode card xml to json
						let card = null;
						try {
							card = xml_parser.parse(xmlData); // ,options);
							if( card.ContactCard ) {
								card = card.ContactCard;
							}
						}
						catch( err ) {
							console.error( 'Invalid XML for contact card: %s', err );
							_events.emit( EVENT_INVALID_XML_CARD, xmlData );
							resolve(false);
						}					

						// Decode (if exists) Caller/Location/Automatic/CEDInterforze/Localization/Value
						let path = 'Caller/Location/Automatic/CEDInterforze/Localization'.split('/');
						let el = card;
						for( let i=0; i<path.length && el; i++ ) {
							el = el[path[i]];
						}
						if( el && XMLValidator.validate(el['Value']) === true) {
							el['Value'] = xml_parser.parse(el['Value']);
						}

						let record = {
							id: card.ID,
							cid: card.CID.toString(),
							created_dt: card.CreateDate,
							json: JSON.stringify(card),
							xml: args.SchedaContatto
						};

						const res = _events.emit( EVENT_CARD_RECEIVED, record );
						resolve( res );
					}
					catch( err ) {
						console.error( "GestContatto: %s", err );
						_events.emit( EVENT_ERROR, err );
						reject( err );
					}
				});
			},

			/*
			// This is how to receive incoming headers
			HeadersAwareFunction: function(args, cb, headers) {
				return {
					name: headers.Token
				};
			},
			*/

			/*
			// You can also inspect the original `req`
			reallyDetailedFunction: function(args, cb, headers, req) {
				console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
				return {
					name: headers.Token
				};
			}
			*/
		}
	}
};

// exports.PSAP2_Service = PSAP2_Service;
module.exports = PSAP2_Service;