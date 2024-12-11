const { XMLParser, XMLValidator } = require('fast-xml-parser');
// const bodyParser = require('body-parser');
// require('body-parser-xml')(bodyParser);
const express = require('express');

let _wsdl = '';
let _service = null;


function handleSOAPReq( req, res ) {

}

function SOAPResponse( xml ) {
	return `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
   <s:Body>
	${xml}
   </s:Body>
</s:Envelope>`;
}

const SoapMiddleware = {
	listen(app, path, soap_service, wsdl, callback) {

		_wsdl = wsdl;
		_service = soap_service;

		// const parser = bodyParser.xml();
		// app.use(express.text({type:'*/*'}));

		// WSDL management
		app.get(path, (req,res, next) => {
			if(req.query.wsdl != null) {
				res.send( _wsdl );
			}
			else
				res.send(404);
		});

		app.post(path, express.text({type:'*/*'}), (req, res, next) => {
			try {
				debugger;
				let b = req.body;
				console.log(req.body);
				res.end();
			}
			catch( err ) {

			}
			next();
		});

		return this;
	},

	log : console.log
};


module.exports = SoapMiddleware;