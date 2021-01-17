import express from 'express';
import path from 'path';
// import { app as electron } from 'electron';

const app = express();
const router = express.Router();

// import crypto from crypto
const port = process.env.EXPRESS_PORT || 4000;

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
	// res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
	res.header('Access-Control-Allow-Methods', 'POST, GET');

	next();
});

app.use('/', router);
// externals js and css need this, in this project is iframe_api.js
app.use('/', express.static(__dirname));

router.get('/', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'index.html'));
});

router.get('/panel', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'panel.html'));
});

app.listen(4000, 'localhost', () => {
	console.log(`Http and WebSocket Server Started On Port ${port} :)`);
});
