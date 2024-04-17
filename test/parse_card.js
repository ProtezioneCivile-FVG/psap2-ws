// const xml_parser = require('fast-xml-parser');
const { XMLParser, XMLValidator } = require('fast-xml-parser');





let args = process.argv.splice(2);
let xml_file = args[0];

if( !xml_file ) {
	console.error( 'XML file not specified');
	process.exit(1);
}

console.log( 'Reading xml from %s', xml_file );
let xmlData = require('fs').readFileSync(xml_file, 'utf8');

const xml_parser = new XMLParser();


try {
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
		console.log("%s: %s", path, el['Value']);
		el['Value'] = xml_parser.parse(el['Value']);
	}

	let record = {
		id: card.ID,
		cid: card.CID.toString(),
		created_dt: card.CreateDate,
		json: JSON.stringify(card),
		xml: args.SchedaContatto
	};

	console.log(JSON.stringify(record, null, 2));
}
catch( err ) {
	console.error( "GestContatto: %s", err );
}

