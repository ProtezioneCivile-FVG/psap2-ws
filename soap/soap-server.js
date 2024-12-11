const { XMLParser, XMLValidator } = require('fast-xml-parser');
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

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

		const parser = bodyParser.xml();

		// WSDL management
		app.get(path + '?wsdl', (req,res, next) => {
			res.send( _wsdl );
			next();
		});

		app.post(path, parser, (req, res, next) => {
			try {
				debugger;
				console.log(req.body);
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