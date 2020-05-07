const CardHandler = require('../CardHandler.js');
const xml_parser = require('fast-xml-parser');

// http://<ip>:<port>/Nue_Services/EntiService
const PSAP2_Service = {
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
				let _handler = CardHandler.get();
				if( !_handler ) {
					console.error('SOAP service not initialized');
					return Promise.resolve(false);
				}


				return new Promise((resolve, reject) => {

					// Decode card xml to json
					let card = null;
					let xmlData = args.SchedaContatto;
					if( xml_parser.validate(xmlData) === true) { //optional (it'll return an object in case it's not valid)
						card = xml_parser.parse(xmlData); // ,options);
						if( card.ContactCard )
							card = card.ContactCard;
					}
					else {
						console.error( 'Invalid XML for contact card' );
						resolve(false);
					}					

					let record = {
						id: card.ID,
						cid: card.CID.toString(),
						created_dt: card.CreateDate,
						json: JSON.stringify(card),
						xml: args.SchedaContatto
					};

					return _handler.addCard( record ).then( (ok) => {
						resolve( ok );
					},
					(err) => {
						console.error( err );
						return Promise.resolve(false);
					});
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

exports.PSAP2_Service = PSAP2_Service;