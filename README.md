# Memory Game

## Résumé

Memory est un mini-jeu réalisé en __HTML__ / __CSS__ / __Javascript__ / __Node.js__

## Gameplay

Le joueur doit trouver toutes les paires de cartes identiques réparties aléatoirement sur le plateau de jeu dans le temps imparti.  
Une fois toutes les paires trouvées, le temps de jeu et les initiales du joueur sont enregistrés dans la base de données.  
Si le joueur n'a pas trouvé toutes les paires de cartes, c'est la défaite.  
Il est possible de recommencer une partie une fois la victoire (ou la défaite) atteinte.  

## Réalisation

La partie serveur (back) est gérée en __Node.js__ et __Express__.  
Pour démarrer le serveur : *npm start*  
Par défaut, la page sera trouvable à l'adresse : http://localhost:3000  

Les événements de la partie sont affichés dans le __canvas__ de la page *index.html*  

La partie client (front) est gérée en __Javascript__ dans le fichier *game.js*. L'affichage des éléments et les événements dans le canvas sont gérés intégralement en Javascript.  

Le lien entre la partie serveur et la partie client est effectué à l'aide des sockets (__socket.io__)

Le temps et les initiales des joueurs gagnants sont enregistrées dans la base de données __MySQL__

## Déroulement du jeu

Tout le déroulement de la partie se trouve dans l'unique fichier *game.js* pour améliorer les performances de la page.
Le côté serveur est géré dans *server.js* et *app.js*

# Explications du fonctionnement

## Démarrage du serveur (serveur)

* Démarrage du serveur avec la commande *npm start* -> Etablissement de l'adresse de la page avec le port donné
* Création de la base de données MySQL highScores et création de la table scores dans la base highScores si elles n'existe pas déjà pour le stockage des scores des parties gagnées (enregistrement du temps de partie et des initiales des joueurs)
* Création des sockets avec *socket.io*

## Affichage de la page (client)

* Affichage du menu dans le canvas (bouton PLAY)
* Affichage des meilleurs scores :
  1. On émet un socket à l'aide de socket.io à destination du serveur pour lui dire que l'on veut récupérer les meilleurs scores
  2. A la réception de ce socket, le serveur fait une requête (MySQL query) à la base de données pour trouver les meilleurs scores et les trier par ordre de temps
  3. Pour chaque score trouvé dans la base de données, le serveur émet un socket d'envoi du score à la partie client
  4. La partie client récupère le socket d'envoi du score et pour chaque score affiche le résultat dans le canvas
* Définition de l'objet Fruit avec son id associé (le nombre de fruits max est défini en fonction du nombre de fruits dans l'image *cards.png*)
* Stockage de tous les objets Fruit dans un tableau
* Démarrage de la boucle de jeu et définition du *gameState* (état du jeu : 0 correspond au menu, 1 au jeu, 2 à la victoire et 3 à la défaite)

## Evénements (client)
Ajout d'un *event listener* sur le canvas pour vérifier les interactions avec celui-ci
* Si le joueur est dans le menu, on vérifie les clics sur le bouton Play
* Si le joueur est en jeu, on vérifie les clics sur les cartes
* Si le joueur a gagné ou perdu, on vérifie les clics sur le bouton Replay
On vérifie les clics sur le canvas en récupérant les coordonnées de la souris sur la page que l'on compare avec les coordonnées des éléments intéractifs de la page.

## En jeu

### Démarrage du jeu

Lorsque le joueur a cliqué sur le bouton Play ou Replay
* On définit le plateau de jeu :
  1. On sélectionne les fruits qui vont être dans le plateau de jeu à partir des fruits disponibles dans le tableau créé à l'initialisation de la page
  2. On double le nombre de fruits pour créer des paires et on les mélange de manière aléatoire
  3. Le plateau récupère ces fruits et créé un objet carte qui stocke le fruit qui lui a été assigné
  4. Le plateau affiche les cartes faces cachées dans le canvas
* On démarre le timer :
  1. On commence un interval qui sera appelé chaque seconde pour augmenter le temps actuel et son affichage
  2. On affiche le temps actuel dans le second canvas dédié au timer qui sera appelé chaque 100ms pour fluidifier l'affichage du timer
  3. Le timer se termine lorsque le temps max a été atteint

### Au cours de la partie

Lorsque le joueur sélectionne une carte, on va chercher le fruit qui est associé à cette carte et on l'affiche.  

Le joueur doit sélectionner deux cartes. Ces deux cartes sont ensuite comparées :
* Si les cartes sélectionnées possèdent le même fruit, la paire est validée et reste affichée sur le plateau de jeu
* Si les cartes sélectionnées ne possèdent pas le même fruit, la paire n'est pas validée. Les fruits sont donc cachés à nouveau.
Le joueur doit ensuite continuer à sélectionner deux cartes jusqu'à ce que le nombre de paires maximum soit atteint (le joueur a gagné) ou que le timer soit terminé (le joueur a perdu). La victoire ou la défaite sont vérifiés à chaque frame dans la boucle de gameplay.

### Le joueur a gagné

Si dans le temps imparti, le joueur a trouvé toutes les paires sur le plateau : le joueur a gagné !  
* On arrête le timer et son affichage dans le canvas
* On définit l'état de win dans le *gameState*
* On affiche un message de victoire dans le canvas
* On affiche le score (temps) du joueur dans le canvas
* On affiche un prompt dans le navigateur et on invite l'utilisateur a entrer ses initiales :
  1. Si le joueur a entré du texte, ses initiales sont récupérées
  2. Si le joueur n'a pas entré de texte, ses initiales seront "???"
* On émet un socket dans la partie client pour dire au serveur qu'un nouveau score doit être enregistré
* A la réception du socket, le serveur récupère le score et les initiales du joueur et l'insère dans la base de données
* On affiche le bouton Replay dans le canvas

### Le joueur a perdu

Si le temps imparti a été atteint et que le joueur n'a pas trouvé toutes les paires sur le plateau : le joueur a perdu... 
* On arrête le timer et son affichage dans le canvas
* On définit l'état de loose dans le *gameState*
* On affiche un message de victoire dans le canvas
* Le score du joueur ayant perdu la partie n'est pas affiché ni sauvegardé
* On affiche le bouton Replay dans le canvas
