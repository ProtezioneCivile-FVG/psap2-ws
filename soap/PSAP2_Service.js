// SPDX-License-Identifier: MIT

const { XMLParser, XMLValidator } = require('fast-xml-parser');
const EventEmitter = require('../lib/EventEmitter.js')

const _events = new EventEmitter();

const xml_parser = new XMLParser();

// Event Names
const EVENT_RAW_CARD_RECEIVED = "raw-card-received";
const EVENT_INVALID_XML_CARD = "invalid-xml-card";
const EVENT_CARD_RECEIVED = "card-received";
const EVENT_ERROR = 'error';


const NESTED_CDATA_FIELDS = [
	'Caller/Location/Automatic/CEDInterforze/Localization',
];

const getElement = (obj, path) => {
	const paths = path.split('/');
	let el = obj;
	for( let i=0; i<paths.length && el; i++ ) {
		el = el[paths[i]];
	}
	return el;
}

const GestContattoResult = (r) => ({ GestContattoResult: r });

// http://<ip>:<port>/Nue_Services/EntiService
const PSAP2_Service = {
	on: (name,callback) => _events.on(name,callback),
	get default_operation() { return this.EntiService.BasicHttpBinding_IEntiService.GestContatto },

	EntiService: {
		BasicHttpBinding_IEntiService: {

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
						let parameters = args.parameters || args;
						// Beta80 args compatibility (in some cases)
						if( Array.isArray(parameters) && parameters[0]?.item) {
							parameters = parameters.reduce( (prev,curr) => {
								// curr is { item: { key, value }}
								if( curr.item )
									prev[curr.item.key] = curr.item.value;
								return prev;
							}, {});
						}

						const xmlCard = parameters.SchedaContatto || parameters;
						delete parameters.SchedaContatto;

						console.log("Raw card: (%s) %s\n\n", typeof(xmlCard), JSON.stringify(xmlCard));
						_events.emit( EVENT_RAW_CARD_RECEIVED, xmlCard );

						// Decode card xml to json
						let card = null;
						try {
							card = xml_parser.parse(xmlCard);
							if( card.ContactCard ) {
								card = card.ContactCard;
							}
						}
						catch( err ) {
							console.error( 'Invalid XML for contact card: %s', err );
							_events.emit( EVENT_INVALID_XML_CARD, xmlCard );
							resolve(GestContattoResult(false));
						}					

						// For each nested CDATA, if exists, parse it and replace element
						for( let i=0; i<NESTED_CDATA_FIELDS.length; i++ ) {
							let el = getElement(card, NESTED_CDATA_FIELDS[i]);

							if( el && XMLValidator.validate(el['Value']) === true) {
								el['Value'] = xml_parser.parse(el['Value']);
							}
						}

						let record = {
							id: card.ID,
							cid: card.CID.toString(),
							created_dt: card.CreateDate,
							json: JSON.stringify(card),
							xml: xmlCard,
							parameters: JSON.stringify(parameters)
						};

						const r = _events.emit( EVENT_CARD_RECEIVED, record );
						if( r.then ) {
							r.then( (rr) => resolve(GestContattoResult(rr)) );
						}
						else
							resolve( GestContattoResult(r) );
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

module.exports = PSAP2_Service;