# Mapty — mon journal sportif

Journal personnel de courses à pied et de sorties vélo, développé à partir de
Mapty de **Jonas Schmedtmann**. La base HTML, CSS, JavaScript et Leaflet est conservée,
ainsi que les modèles `Workout`, `Running`, `Cycling` et la classe `App`.
**Aucun framework, gestionnaire de dépendances ou outil de compilation.**

## Démarrer sur ce Mac

```sh
cd /Users/marcbookairm1/Documents/PROJETS_JS/mapty-portfolio
python3 -m http.server 8080 --bind 127.0.0.1
```

Ouvrir <http://127.0.0.1:8080>. Pour arrêter le serveur : `Ctrl+C`.
Si un serveur fonctionne déjà sur ce port, ouvrir simplement l’adresse existante.
Le serveur local doit rester limité au projet : ne pas le lancer dans le dossier du cours.

## Utiliser le journal

- Cliquer sur **Nouvelle séance**, **Ajouter ici**, ou sur un point de la carte.
- Saisir le sport, la date, la distance et la durée ; ajouter la cadence pour
  une course ou le dénivelé pour une sortie vélo. Les décimales avec une virgule
  ou un point sont acceptées. Le dénivelé peut être nul ou négatif.
- Enregistrer avec le bouton visible. Modifier ou supprimer une séance depuis
  sa fiche. Une suppression demande confirmation.
- Le bilan de **cette semaine** couvre le lundi au dimanche, tous sports confondus.
  Les filtres de la liste ne changent pas ce bilan. La liste et les marqueurs
  utilisent les mêmes filtres de sport et de période.
- **Voir sur la carte** ouvre le marqueur. Le journal associe un lieu à une
  séance ; il n’enregistre pas le trajet GPS.
- Sur téléphone, le journal et la carte se suivent. Le lien du formulaire
  permet d’aller à la carte ; **Choisir ce lieu** utilise son centre. Le clavier
  permet aussi de déplacer la carte puis d’utiliser ce bouton.

## Chargement et localisation

Leaflet **1.6.0**, ses images et la police Manrope sont distribués localement dans
`vendor/`. Leur version d’origine est conservée ; aucune mise à niveau n’est faite.
La carte démarre sans demander la position : dernière vue mémorisée, sinon Abidjan.
**Me localiser** est facultatif. Le délai d’acquisition est limité à 7 secondes,
avec un délai applicatif de 9 secondes couvrant aussi une permission sans réponse.
Un échec de localisation ne bloque jamais le journal.

Internet reste nécessaire pour les fonds de carte OpenStreetMap France.
Les échecs de tuiles sont signalés avec une action pour réessayer. Le journal,
les formulaires, l’import et l’export restent accessibles sans fond de carte.

## Sauvegardes et compatibilité

Les séances restent dans le stockage local du navigateur, clé `workouts`, pour
cette adresse et ce port. Elles ne sont ni synchronisées ni envoyées vers un serveur.
Le passage entre `localhost` et `127.0.0.1`, ou le changement de port/navigateur,
donne accès à un autre stockage : utiliser l’export pour transférer le journal.

Les anciennes sauvegardes du cours sont relues automatiquement : identifiants,
coordonnées, dates et valeurs sont conservés, les descriptions sont recalculées en français.
Un historique illisible est conservé sans écrasement. L’interface permet de le
récupérer brut avant une réinitialisation explicitement confirmée.
Si le stockage est inaccessible ou plein, les changements restent dans l’onglet
et un message demande d’exporter avant de le fermer.

**Exporter** télécharge un fichier JSON versionné. **Importer** accepte ce format
ou un tableau de séances de l’ancienne version. L’import fusionne les séances :
un identifiant déjà présent conserve sa version locale. Un fichier mal formé
est rejeté intégralement. Limites : 10 Mo par fichier, 10 000 séances au total.

## Vérifier la logique

Avec Node.js déjà installé sur ce Mac, sans installation :

```sh
node --test tests/workouts.test.mjs
```

Les tests couvrent calculs, décimales françaises, dates, anciens historiques,
validation des imports, fusion, bilans hebdomadaires et filtres.
Les modules JavaScript natifs servent à isoler cette logique testable ; il n’y
a aucune étape de compilation.

## Crédits et conditions d’origine

Application originale **Mapty © Jonas Schmedtmann**,
issue de `complete-javascript-course-master/15-Mapty/final`.
Le cours original n’est pas modifié. `COURSE_README.md` conserve sa documentation.
Les ajouts personnels sont la francisation, la saisie datée, la gestion des séances,
les bilans, filtres, sauvegardes et l’adaptation responsive.

Le dossier du cours fourni ne contient aucun fichier LICENSE séparé.
Aucune nouvelle licence n’est attribuée au code original. La mention d’origine
est conservée dans l’interface, son code source et ici :

> Use for learning or your portfolio. Don't use to teach. Don't claim as your own.

Voir aussi la FAQ Q8 dans `COURSE_README.md`.

- Leaflet : Copyright Vladimir Agafonkin et contributeurs, licence BSD-2-Clause
  conservée dans `vendor/leaflet/LICENSE`.
- Manrope : licence SIL Open Font License, conservée dans `vendor/fonts/OFL.txt`.
- Fonds de carte : contributeurs OpenStreetMap, tuiles OpenStreetMap France ;
  attribution visible sur la carte.

Le dépôt reste local. Aucun dépôt GitHub, push ou hébergement n’est créé.
