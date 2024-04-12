const soap = require('soap');
const util = require('util');

let url = 'http://localhost:8001/Nue_Services/EntiService?wsdl';

//let args = {SchedaContatto: 'Ciao, sono una scheda contatto'};


let args = process.argv.splice(2);
let xml_file = args[0];

if( !xml_file ) {
	console.error( 'XML file not specified');
	process.exit(1);
}

console.log( 'Reading xml from %s', xml_file );
let xml = require('fs').readFileSync(xml_file, 'utf8');

function escapeCDATA(xml) {
	let regex = /\]\]>/g;
	let res = xml.replace(regex, "]]]]><![CDATA[>]]>");
	return res;
}
function cdataOf(xml) {
	return "<![CDATA[" + escapeCDATA(xml) + "]]>";
}

let server = args[1] || "psap2ws.protezionecivile.fvg.it";
url = url.replace('localhost', server);

console.log( 'Parsing wsdl from %s', url );

soap.createClient(url, function(err, client) {
	if( err ) {
		 console.error( 'Error: %s', err );
		 return;
	}
	// console.log( "client.describe: %s", util.inspect(client.describe()) );
	let parms = {
		// SchedaContatto: cdataOf(xml)
		// SchedaContatto: escapeCDATA(xml)
		SchedaContatto: xml
	};

	console.log(parms.SchedaContatto);

	console.log( 'Invoking soap method' );
	client.GestContatto(parms, function(err, result) {
		if( err ) console.error( 'Invoke Error: %s', err );
		
		console.log('Result is:\n%s', result);
	});
});