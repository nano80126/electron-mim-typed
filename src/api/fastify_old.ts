import fastify from 'fastify';

const PORT = process.env.PORT || 3000;
const app = fastify({ logger: true });

app.get('/', function(req, res) {
	res.send({ hello: 'world' });
});

app.get('/ping', function(req, res) {
	res.send({ hello: 'world' });
});

app.listen(PORT, function(err, address) {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	console.log(err);
	console.log(address);
});
