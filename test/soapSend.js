// SPDX-License-Identifier: MIT

/*
	Send an XML contact card via SOAP.
	Simulates the PSAP1 message.

	Syntax: node soapSend.js xml-file-of-contact-card [server-address]
	The default server address is localhost
*/

require('dotenv').config({path: __dirname + '/../.env'});

const soap = require('soap');
const util = require('util');

let url = `http://localhost:${process.env.WS_PORT ?? 8001}/Nue_Services/EntiService?wsdl`;


let args = process.argv.splice(2);
let xml_file = args[0];

if( !xml_file ) {
	console.error( 'XML file not specified');
	process.exit(1);
}

console.log( 'Reading xml from %s', xml_file );
let xml = require('fs').readFileSync(xml_file, 'utf8');

const server = args[1];
if( server )
	url = url.replace('localhost', server);


function escapeCDATA(xml) {
	let regex = /\]\]>/g;
	let res = xml.replace(regex, "]]]]><![CDATA[>]]>");
	return res;
}
function cdataOf(xml) {
	return "<![CDATA[" + escapeCDATA(xml) + "]]>";
}


console.log( 'Parsing wsdl from %s', url );

soap.createClient(url, function(err, client) {
	if( err ) {
		 console.error( 'Error: %s', err );
		 return;
	}
	console.log( "client.describe: %s", util.inspect(client.describe()) );
	let parms = {
		// SchedaContatto: cdataOf(xml)
		// SchedaContatto: escapeCDATA(xml)
		SchedaContatto: xml,
		EnteMittente: "NUE",
		ProvinciaMittente: "UD"
	};
	// Wrong Data Invocation Test
	// let parms = { parameters : [
	// 	{item: {key: "SchedaContatto", value: xml }},
	// 	{item: {key: "EnteMittente", value: "NUE" }},
	// 	{item: {key: "ProvinciaMittente", value: "UD" }},
	// ]};

	// console.log(parms.SchedaContatto);

	console.log( 'Invoking soap method, url is : %s', url );
	client.GestContatto(parms, function(err, result) {
		if( err ) console.error( 'Invoke Error: %s', err );
		
		console.log('Result is:\n%s', result);
	});
});