const express = require('express');

// création de l'app express
const app = express();

// définition du point d'entrée de l'app
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/src/index.html');
});

// ajout des fichiers utilisés en front
app.use(express.static(__dirname + '/src'));

module.exports = app;