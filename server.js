// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const Options = require('./Options').Options;

const WebOptions = Options.web || {};

let Home = require('./routes/Home.js');
let ContactCard = require('./routes/ContactCard.js');

fastify.register( Home );
fastify.register( ContactCard );

// Run the server!
let server_port = WebOptions.port || 3000;
const start = async () => {
  try {
    await fastify.listen(server_port)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()