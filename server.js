const http = require('http');
const app = require('./app');

const normalizePort = val => {
	const port = parseInt(val, 10);
	if (isNaN(port)) {
		return val;
	}
	if (port >= 0) {
		return port;
	}
	return false;
};

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const adress = server.address();
	const bind = typeof address === 'string' ? 'pipe' + address : 'port: ' + port;
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges.');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use.');
			process.exit(1);
			break;
		default:
			throw error;
	}
};

// création du serveur
const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
	const address = server.address();
	const bind = typeof address === 'string' ? 'pipe' + address : 'port: ' + port;
	console.log('Listening on ' + bind);
});

// ajout de socket.io
const io = require('socket.io')(server);

// connection au socket
io.on('connection', (socket) => {
	console.log('Connecté au client ' + socket.id);
	// quand on reçoit un nouveau score
	socket.on('new score', (score, initial) => {
		console.log('New score: ' + score);
		// sauvegarde du score dans la base de données
		saveScore(score, initial);
	});
	// quand on reçoit une requête d'afficher les highscores
	socket.on('show scores', function () {
		getScores();
	});
});

// base de données MySQL
var mysql = require('mysql');
console.log('Essai de connexion à la base de données...');
var conn = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "12345"
});

// connexion à la base de données
conn.connect(function(err) {
	if (err) throw err;
	// création de la base de données highScores si elle n'existe pas encore
	conn.query("CREATE DATABASE IF NOT EXISTS highScores", function (err, result) {
		if (err) throw err;
		console.log("Base de données créée");
	});

	// création de la table scores si elle n'existe pas encore
	conn.query("CREATE TABLE IF NOT EXISTS highScores.scores (time INT, initial VARCHAR(3))", function (err, result) {
		if (err) throw err;
		console.log("Table Score créée");
	});
	console.log("Connecté à la base de données!");
});

// sauvegarder le score dans la base de données
function saveScore(score, initial) {
	var sql = "INSERT INTO highScores.scores(time, initial) VALUES (?, ?)";
	conn.query(sql, [score, initial], function(err, result){
		if (err) throw err;
		console.log("Entrée score ajouté!");
	});
}

// récupérer les highscores dans la base de données
function getScores() {
	var sql = "SELECT * FROM highscores.scores ORDER BY time LIMIT 5";
	var result = [];
	conn.query(sql, function (err, res, fields) {
		if (err) throw err;
		if (res.length) {
			for (var i = 0; i < res.length; i++) {
				result.push(res[i]);
				io.emit('send score', {value: res[i], nbrVal: res.length});
			}
		} else {
			io.emit('send score', false);
		}
	});
}

server.listen(port);