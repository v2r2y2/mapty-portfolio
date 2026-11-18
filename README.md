# Mapty — copie locale du projet du cours

Application originale de **Jonas Schmedtmann**, extraite sans modification de
`complete-javascript-course-master/15-Mapty/final`.
Le dossier `starter` du cours est le point de départ ; `final` est la version complète.

## Démarrer en local

Python 3 est déjà installé sur ce Mac. Depuis un terminal :

```sh
cd /Users/marcbookairm1/Documents/PROJETS_JS/mapty-portfolio
python3 -m http.server 8080 --bind 127.0.0.1
```

Ouvrir <http://127.0.0.1:8080>. Pour arrêter le serveur : `Ctrl+C`.
Aucune installation npm, aucun build et aucune clé API ne sont nécessaires.
Une connexion Internet est nécessaire pour Leaflet 1.6.0 (unpkg), la police
Google Fonts et les fonds de carte OpenStreetMap.

## Utilisation

1. Autoriser la localisation dans le navigateur pour afficher la carte.
2. Cliquer sur la carte pour ouvrir le formulaire.
3. Choisir Running (course) ou Cycling (vélo), saisir distance et durée,
   puis cadence ou dénivelé. Appuyer sur Entrée pour enregistrer.
4. Cliquer sur une activité pour recentrer la carte.
5. Les activités sont conservées dans le stockage local de ce navigateur,
   pour cette adresse et ce port. Recharger la page pour les retrouver.

La version originale affiche une alerte si la localisation est refusée et ne
charge alors pas la carte. Autoriser la localisation puis recharger la page.

## Structure

- `index.html` : interface et chargement de Leaflet depuis le CDN.
- `style.css` : styles d'origine.
- `script.js` : géolocalisation, carte, activités et stockage local.
- `logo.png`, `icon.png` : ressources visuelles d'origine.
- `Mapty-*.png`, `other.js`, `.prettierrc` : fichiers du dossier final, conservés.
- `COURSE_README.md` : documentation originale du cours, conservée intégralement.

## Crédits et conditions d'utilisation d'origine

© Jonas Schmedtmann. Les crédits visibles dans l'application sont conservés.
Le dossier de cours fourni ne contient aucun fichier LICENSE séparé ; aucune
nouvelle licence n'est attribuée à cette copie. Les conditions originales dans
`index.html` sont conservées :

> Use for learning or your portfolio. Don't use to teach. Don't claim as your own.

Voir également la FAQ Q8 du fichier `COURSE_README.md` pour les conditions
liées à l'utilisation dans un portfolio. Cette copie est présentée comme
un projet du cours de Jonas Schmedtmann.

Seul ce nouveau dossier possède son propre dépôt Git local. Aucun dépôt distant
n'est configuré ; aucun push ni hébergement n'est effectué à cette étape.

## Vérification locale du 18 novembre 2026

Vérifié dans Chrome avec une position de test à Abidjan, sans accès à la
position réelle de l'utilisateur : affichage des fonds de carte, course de
5 km en 25 min à 170 pas/min (allure 5,0 min/km), sortie vélo de 20 km en
60 min avec 120 m de dénivelé (vitesse 20,0 km/h), marqueurs, recentrage par
clic sur une activité, conservation des deux activités et de leurs marqueurs
après rechargement. Une distance négative a été refusée sans ajout d'activité.
Aucune erreur JavaScript ni avertissement dans la console pendant les tests.
Les activités de test ont été supprimées du navigateur après vérification.
La géolocalisation réelle reste à autoriser dans votre navigateur.
