/*
** GAME
*/

// définition du canvas
const canvas = document.getElementById('game-container');;
const context = canvas.getContext('2d');

// Variables du jeu
let gameState = 0; // statut du jeu 0 : menu / 1 : jeu / 2 : win / 3 : loose
let btnPlay; // paramètres du bouton play
let btnReplay; // paramètres du bouton replay

// Variables du plateau de jeu
const nbrX = 7; // nbr de cartes horizontal
const nbrY = 4; // nbr de cartes vertical
const padding = 20; // padding entre les cartes
const sizeX = ((canvas.width - padding) / nbrX) - (padding); // taille de la carte X
const sizeY = ((canvas.height - padding) / nbrY) - (padding); // taille de la carte Y
let fruitsImg = new Image();
fruitsImg.src = 'img/cards.png';

let myBoard = []; // plateau de jeu
let fruits = []; // fruits affichables
let fruitsOnBoard = []; // fruits choisis pour le plateau

//nombre de paires;
const nbrPair = nbrX * nbrY / 2;
let actualNbrPair = 0;

// limiter la sélection de cards
let nbrMaxSelected = 2;
let cardsSelected = [];
let waiting = false;

// timer
let actualTime;
let maxTime = 120;
let timerInterval;
let timerIntervalDisplay;
const canvasT = document.getElementById('time-container');
const contextT = canvasT.getContext('2d');
let tmpTime;

// socket.io
const socket = io();

// score
let highscores = [];

// au chargement de la page
window.onload = function () {
	startGame();
}

function startGame() {

	setMenuState();

	// créer les objets fruits
	defineFruits();

	// démarrage de la boucle de gameplay
	window.requestAnimationFrame(gameLoop);
}

function setMenuState() {
	gameState = 0;

	context.clearRect(0, 0, canvas.width, canvas.height);

	// affichage du menu Play
	btnPlay = displayButton("PLAY", 150, 75);

	context.globalAlpha = 0.5;
	context.fillStyle = "#005b96";
	context.font = "bold 200px Montserrat";
	context.fillText("MEMORY", 20, canvas.height / 2 + 20);
	context.globalAlpha = 1;

	// affichage des highscores
	displayHighscores();
}

/*
** GAME LOOP
*/

function gameLoop(timeStamp){
    switch (gameState) {
    	case 0 :
    		break;
    	case 1 :
    		//console.log("En jeu");
    		if (actualNbrPair == nbrPair)
    			setWinState();
    		else if (actualNbrPair < nbrPair && actualTime >= maxTime)
    			setLoseState();
    		break;
    	case 2 :
    		//console.log("Win");
    		break;
    	case 3 :
    		//console.log("Loose");
    		break;
    	default :
    		console.log("Aucun statut de jeu");
    }
    // Keep requesting new frames
    window.requestAnimationFrame(gameLoop);
}

/*
** Classes
*/

function fruit (id){
	this.id = id;
}

function card(pos, startX, startY, width, height, fill, fruit, isActive) {
	this.pos = pos; // position sur le plateau
	this.startX = startX; // coordonnées sur le plateau
	this.startY = startY;
	this.width = width;
	this.height = height;
	this.fill = fill;
	this.fruit = fruit; // fruit associé à la carte
	this.isActive = isActive;
}

function defineFruits() {
	for (var i = 0; i < 18; i++) {
		fruits.push(new fruit(i));
	}
}

/*
** PLATEAU DE JEU
*/

// répartition des cartes sur le plateau
function defineBoard(nbrX, nbrY, padding, sizeX, sizeY) {
	var myBoard = [];
	var startPointX;
	var startPointY;
	var color = "#6497b1";
	var pos = 0;

	// define cards on board
	for (var i = 0; i < nbrY; i++) {
		if (i > 0) {
			startPointY = i * sizeY + ((i+1) * padding);
		} else {
			startPointY = padding;
		}
		for (var j = 0; j < nbrX; j++) {
			if (j > 0) {
				startPointX = j * sizeX + ((j+1) * padding);
			} else {
				startPointX = padding;
			}
			pos = i * nbrX + j;
			myBoard.push(new card(pos, startPointX, startPointY, sizeX, sizeY, color, fruitsOnBoard[pos], false));
		}
	}
	return myBoard;
}

// définition des fruits sur le plateau
function defineFruitsOnBoard(nbrX, nbrY) {
	var fruitsType = [];
	for (var i = 0; i < (nbrX * nbrY) / 2; i++) {
		if (i < fruits.length) {
			fruitsType.push(fruits[i]);
			fruitsType.push(fruits[i]);
		}
	}
	return shuffle(fruitsType);
}

// on mélange les cartes
function shuffle(array) {
	array.sort(() => Math.random() - 0.5);
	return array;
}

// on dessine le plateau de cartes
function drawBoard(myBoard) {
	context.clearRect(0,0,canvas.width, canvas.height);
	for (var i in myBoard) {
		myCard = myBoard[i];
		context.fillStyle = myCard.fill;
		context.fillRect(myCard.startX, myCard.startY, myCard.width, myCard.height);
	}
}

// on dessine la carte
function drawCard (myCard) {
	context.clearRect(myCard.startX, myCard.startY, myCard.width, myCard.height);

	context.fillStyle = myCard.fill;
	context.fillRect(myCard.startX, myCard.startY, myCard.width, myCard.height);
}


// initialisation du plateau de jeu
function setBoard() {

	// définition du deck de fruits
	fruitsOnBoard = defineFruitsOnBoard(nbrX, nbrY);
	// répartition des cartes fruits
	myBoard = defineBoard(nbrX, nbrY, padding, sizeX, sizeY);

	// démarrage du timer
	startTimer();

	// affichage des cartes faces cachées
	drawBoard(myBoard);
}

/*
** Timer
*/

function startTimer() {
	actualTime = 0;
	var tmpTime = 0;

	contextT.clearRect(0,0,canvas.width, canvas.height);
	timerInterval = setInterval(function() {
	    actualTime += 1;
	    tmpTime = actualTime;
	    console.log(actualTime);
	}, 1000);

	 timerIntervalDisplay = setInterval(function () {
	 	tmpTime += 0.1;
	 	drawTimer(tmpTime);
	 }, 100);
}

function drawTimer(tmpTime) {
	var timerValue = (tmpTime * canvas.width) / maxTime;
	contextT.fillStyle = "#851e3e";
	contextT.fillRect(0, 0, timerValue, canvasT.height);
}


/*
** WIN / LOOSE
*/

function setWinState() {

	// stop timer
	clearInterval(timerInterval);
	clearInterval(timerIntervalDisplay);
	tmpTime = actualTime;
	actualTime = 0;

	gameState = 2;
	actualNbrPair = 0;

	// draw background transparent
	context.globalAlpha = 0.6;
	context.fillStyle = "white";
	context.fillRect(0,0,canvas.width, canvas.height);

	// draw text
	context.fillStyle = "#005b96";
	context.font = "bold 200px Montserrat";
	context.fillText("YOU WIN", 20, canvas.height / 2 + 20);

	context.globalAlpha = 1;
	setTimeout(function() {
		// display replay button
		btnReplay = displayButton("REPLAY", 200, 75);
		// save highscore
		saveHighscore(tmpTime);
	}, 1000);

	// show score
	context.fillStyle = "#851e3e";
	context.font = "bold 30px Montserrat";
	context.fillText("SCORE : " + tmpTime, 30, 60);
}

function setLoseState() {

	// stop timer
	clearInterval(timerInterval);
	clearInterval(timerIntervalDisplay);
	actualTime = 0;

	gameState = 3;

	// draw background transparent
	context.globalAlpha = 0.5;
	context.fillStyle = "white";
	context.fillRect(0,0,canvas.width, canvas.height);


	context.fillStyle = "#851e3e";
	context.font = "bold 175px Montserrat";
	context.fillText("YOU LOST", 20, canvas.height / 2 + 20);

	// display replay button
	context.globalAlpha = 1;
	setTimeout(function() {
		btnReplay = displayButton("REPLAY", 200, 75);
	}, 1000);
}


/*
** MENU
*/

function buttonParams(width, height, startX, startY) {
	this.width = width;
	this.height = height;
	this.startX = startX;
	this.startY = startY;
}

function displayButton(txt, btnWidth, btnHeight) {
	// button
	var startX = (canvas.width / 2) - (btnWidth / 2);
	var startY = 100;

	context.globalAlpha = 1;

	context.rect(startX, startY, btnWidth, btnHeight);
	context.fillStyle = "#2a4d69";
	context.fill();

	context.globalAlpha = 1;
	context.fillStyle = "white";
	context.font = "bold 40px Montserrat";
	context.fillText(txt, startX + 20, startY + (btnHeight / 2) + 12.5);

	return (new buttonParams(btnWidth, btnHeight, startX, startY));
}

/*
** HIGHSCORES
*/

function drawStyleHighscores(startX, startY, rectWidth, rectHeight, textStartX, textStartY) {
	context.lineWidth = 5;
	context.beginPath();
	context.moveTo(startX, startY);
	context.lineTo(startX + rectWidth, startY);
	context.moveTo(startX + rectWidth, startY);
	context.lineTo(startX + rectWidth, startY + rectHeight);
	context.moveTo(startX + rectWidth, startY + rectHeight);
	context.lineTo(startX, startY + rectHeight);
	context.moveTo(startX, startY + rectHeight);
	context.lineTo(startX, startY);
	context.strokeStyle = "#2a4d69";
	context.stroke();

	context.fillStyle = "#011f4b";
	context.font = "bold 40px Montserrat";
	context.fillText("HIGHSCORES", textStartX - 40, textStartY);
	textStartY += 50;
	return textStartY;
}

function saveHighscore(time) {
	var initial = prompt("Vous avez gagné !\nEntrez vos initiales pour sauvegarder votre score:");
	if (initial == null || initial == "") {
		console.log("L'utilisateur a annulé le prompt.");
		socket.emit('new score', time, "???");
	} else {
		var res = initial;
		if (initial.length > 3)
			res = initial.slice(0,3);
		socket.emit('new score', time, res);
	}
}

function displayHighscores() {
	highscores = [];
	var rectWidth = 315;
	var rectHeight = 315;
	var startX = (canvas.width / 2) - (rectWidth / 2);
	var startY = 250;
	var textStartX = startX + (rectWidth / 2) - 100;
	var textStartY = startY + 50;
	var limitDisplay = 5;
	var actualDisplay = 0;

	textStartY = drawStyleHighscores(startX, startY, rectWidth, rectHeight, textStartX, textStartY);

	socket.emit('show scores');
	socket.on('send score', function(score) {
		if (score) {
			if (actualDisplay < limitDisplay && actualDisplay < score.nbrVal) {
				// on attend l'émission du score pour l'afficher
				highscores.push(score);
				context.fillStyle = "#011f4b";
				context.font = "bold 30px Montserrat";
				context.fillText((actualDisplay + 1) + " - " + score.value.time + "s " + score.value.initial, textStartX, textStartY);
				textStartY += 50;
				actualDisplay++;
			}
		} else {
			context.fillStyle = "#011f4b";
			context.font = "bold 30px Montserrat";
			context.fillText("Aucun score!", textStartX, textStartY);
			textStartY += 50;
		}
	});
}

/*
** EVENTS
*/

// menus
function getPlayClicked(coord, btn) {
	// on vérifie que le clic était sur un bouton
	if (coord.x > btn.startX && coord.x < btn.startX + btn.width && coord.y > btn.startY && coord.y < btn.startY + btn.height) {
		// si le bouton Play a été sélectionné
		// démarrer le jeu
		gameState = 1;
		context.clearRect(0,0,canvas.width, canvas.height);
		setTimeout(function() {
			setBoard();
		}, 100);
	}
}

// en jeu

// masquer le fruit sur la carte sélectionnée
function hideFruit(myCard) {
	drawCard(myCard);
}

function resetSelectedCards(cardsSelected) {
	for (var i = 0; i < cardsSelected.length; i++) {
		hideFruit(cardsSelected[i]);
	}
}

// afficher le fruit sur la carte sélectionnée
function displayFruit(myCard) {
	var sizeX = myCard.width - 5;
	var sizeY = sizeX;
	var cropX = 100;
	var cropY = 100;
	var posX = myCard.startX + (myCard.width/2) - (sizeX/2);
	var posY = myCard.startY + (myCard.height/2) - (sizeY/2);
	var fruitPos = myCard.fruit.id * 100;

	context.drawImage(fruitsImg,
		0,fruitPos,		// crop à la position
		cropX,cropY,	// crop en taille
		posX,posY,		// coordonnées sur le canvas
		sizeX,sizeY);	// scale sur le canvas
}

function checkSelectedCards() {
	let isValid;

	if (cardsSelected[0].fruit.id == cardsSelected[1].fruit.id) {
		// si couple de cartes valide on passe à la suite
		console.log("Même cartes !");
		actualNbrPair++;
	} else {
		// sinon on redessine les cartes
		console.log("Pas les mêmes cartes!");
		myBoard[cardsSelected[0].pos].isActive = false;
		myBoard[cardsSelected[1].pos].isActive = false;
		setTimeout(function() {
			resetSelectedCards(cardsSelected);
		}, 1000);
	}

	// on vide les cartes sélectionnées
	setTimeout(function() {
		waiting = false;
		cardsSelected = [];
	}, 1000);
}

function getCardClicked(coord) {
	// on vérifie qu'une carte a été activée
	var myCard;
	for (var i in myBoard) {
		myCard = myBoard[i];
		if (coord.x > myCard.startX && coord.x < myCard.startX + myCard.width && coord.y > myCard.startY && coord.y < myCard.startY + myCard.height) {
			if (!myCard.isActive) {
				myBoard[i].isActive = true;
				cardsSelected.push(myCard);
				displayFruit(myCard);
				switch (cardsSelected.length) {
					case 1:
						// si nbr de cartes séléctionnées < 2, on attend une autre sélection
						break;
					case 2:
						//console.log("2 cartes sélectionnées");
						waiting = true;
						checkSelectedCards();
						break;
					default:
						console.log("Aucune carte sélectionnée.");
				}
			}
		}
	}
}

// on récupère les coordonnées du clic sur le canvas
function mPosition(x, y) {
	this.x = x;
	this.y = y;
}

// on récupère les coordonnées du clic
function getMousePosition(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;
	let coord = new mPosition(x, y);
	return coord;
}

// on vérifie les clics dans le canvas
canvas.addEventListener('mousedown', function(event) {
	switch (gameState) {
		case 0 :
			// dans le menu
			getPlayClicked(getMousePosition(canvas, event), btnPlay);
			break;
		case 1 :
			// dans le jeu
			if (!waiting) {
				getCardClicked(getMousePosition(canvas, event));
			}
			break;
		case 2:
		case 3:
			// win / loose
			getPlayClicked(getMousePosition(canvas, event), btnReplay);
			break;
		default :
			break;
	}
});

/*
** TEST
*/

/*
// check if JS file is linked to HTML
function addHeadingToPage() {
    var heading = document.getElementById('heading');

    heading.innerHTML = "Memory Game";
}

addHeadingToPage();

var heading = document.getElementById('heading');
heading.addEventListener("click", setMenuState());
*/