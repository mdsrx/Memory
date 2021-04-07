# Memory Game

## Résumé

Memory est un mini-jeu réalisé en __HTML__ / __CSS__ / __Javascript__ / __Node.js__

## Gameplay

Le joueur doit trouver toutes les paires de cartes identiques réparties aléatoirement sur le plateau de jeu dans le temps imparti.  
Une fois toutes les paires trouvées, le temps de jeu et les initiales du joueur sont enregistrés dans la base de données.  
Il est possible de recommencer une partie une fois la victoire (ou la défaite) atteinte.  

## Réalisation

La partie serveur (back) est gérée en __Node.js__ et __Express__. Pour démarrer le serveur : *npm start*  

Les événements de la partie sont affichés dans le __canvas__ de la page *index.html*  

La partie client (front) est gérée en __Javascript__ dans le fichier *game.js*. L'affichage des éléments et les événements dans le canvas sont géré intégralement en Javascript.  

Le lien entre la partie serveur et la partie client est effectué à l'aide des sockets (__socket.io__)

Le temps et les initiales des joueurs gagnants sont enregistrées dans la base de données __MySQL__



