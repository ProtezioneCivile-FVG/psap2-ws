

function route (fastify, opts, next) {
	fastify.get('/', async (req, reply) => {

		let response = {
			hello: world
		};

		reply.send( response );
	});

	next();
}

module.exports = route;
  