const { XMLParser, XMLValidator } = require('fast-xml-parser');
const express = require('express');

let _wsdl = '';
let _service = null;
const _xml_parser = new XMLParser();


function SOAPResponse( xml ) {
	return `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
   <s:Body>
	${xml}
   </s:Body>
</s:Envelope>`;
}

const CDATA = (s) => `<![CDATA[${s}]]>`;


const SoapMiddleware = {
	listen(app, path, soap_service, wsdl, callback) {

		_wsdl = wsdl;
		_service = soap_service;

		// WSDL management
		app.get(path, (req,res, next) => {
			if(req.query.wsdl != null) {
				res.send( _wsdl );
			}
			else
				res.send(404);
		});

		const _rx_ENVL = /[^:]+:Envelope/;
		const _rx_BODY = /[^:]+:Body/;
		app.post(path, express.text({type:'*/*'}), async (req, res, next) => {

			let soap = {};
			try {
				const http_body = req.body;
				const soap_obj = _xml_parser.parse(http_body);
				const envelopeTag = Object.keys(soap_obj).find( k => _rx_ENVL.test(k) );
				if(!envelopeTag) throw "No soap:Envelope found";

				const envelope = soap_obj[envelopeTag];
				const bodyTag = Object.keys(envelope).find( k => _rx_BODY.test(k) );
				if(!bodyTag) throw "No soap:Body found";

				soap.body = envelope[bodyTag];
			}
			catch( err ) {
				console.error( 'Invalid XML for SOAP request: %s', err );
				res.send(400, err);
			}				

			// SOAP Body parsed into json: pass it to service
			try {
				const method = soap_service.default_operation;
				let response = await method(soap.body);
				res.send(200, SOAPResponse(CDATA(response)));
			}
			catch( err ) {
				console.error( 'Failure while handling SOAP Request: %s', err );
				res.send(200, SOAPResponse(CDATA(err.toString())));
			}

		});

		return this;
	},

	log : console.log
};


module.exports = SoapMiddleware;