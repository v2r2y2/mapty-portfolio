# Mapty · Carnet de sorties

Journal personnel adapté de **Mapty, de Jonas Schmedtmann**. HTML, CSS,
JavaScript natif et Leaflet 1.6.0 conservés, avec les modèles `Workout`,
`Running`, `Cycling` et la classe `App`. Aucun framework, installation npm,
clé API ou compilation.

## Démarrer sur ce Mac

```sh
cd /Users/marcbookairm1/Documents/PROJETS_JS/mapty-portfolio
python3 -m http.server 8080 --bind 127.0.0.1
```

Ouvrir <http://127.0.0.1:8080>. Si le serveur fonctionne déjà, ouvrir simplement
l’adresse. `Ctrl+C` l’arrête. Ne pas lancer le serveur depuis le cours original.

## Utiliser le carnet

1. **Ajouter une séance** ouvre un écran dédié. Choisir sport, date, distance et
   durée. Nom, cadence et dénivelé sont facultatifs. Virgule et point décimaux
   sont acceptés ; le dénivelé peut être négatif.
2. Facultativement, **Définir un départ et une arrivée** ouvre la carte. Toucher
   A puis B. Les boutons Départ/Arrivée permettent de reprendre un point ; les
   marqueurs sont déplaçables. Au clavier, déplacer la carte avec les flèches,
   puis **Placer au centre de la carte** pour chacun des points.
3. **Calculer le trajet** demande un itinéraire par les rues et chemins, à pied
   ou à vélo selon le sport. Vérifier le tracé puis **Utiliser ce trajet**.
   La distance est renseignée mais reste ajustable.
4. **Enregistrer la séance** ouvre sa fiche, avec consultation du trajet,
   modification et suppression confirmée.

Inverser A/B ou changer le sport demande un nouveau calcul. Un échec ne crée
jamais de ligne droite de remplacement. Revenir à la saisie sans accepter un
nouveau trajet conserve le précédent. Le parcours planifié ne représente pas
un enregistrement GPS effectué en direct.

Le bilan couvre le lundi au dimanche. Filtres et tri concernent le journal ;
la carte affiche tous les lieux enregistrés et souligne la séance ouverte.
Une séance peut rester sans lieu. Les anciens points uniques sont conservés.

## Interface et chargement

Téléphone : Journal, Carte, Saisie et Fiche sont des écrans séparés. Navigation
en bas, masquée pendant la saisie et le choix A/B. Le formulaire défile
indépendamment de son bouton d’enregistrement. Tablette : lecture et saisie
centrées avec largeur limitée. Dès 1 050 px : journal et carte en parallèle ;
choix A/B sur toute la largeur. Police système, sans téléchargement de police.

Le journal mobile ne demande ni carte ni géolocalisation au démarrage. La carte
est créée à sa première ouverture, ou immédiatement sur grand écran. Dernière
vue mémorisée, sinon Abidjan. **Me localiser** est facultatif : délai de 7 secondes
et limite applicative de 9 secondes couvrant une permission sans réponse.
Le bouton demande une position fraîche et précise, puis affiche un point bleu
et un cercle représentant la précision annoncée par le navigateur. Une position
approximative entraîne un cadrage plus large. Le repère reste distinct des points
A/B et ne crée aucune séance. Il est actualisé à chaque clic, sans suivi continu.
L’heure du relevé est affichée lorsqu’elle est fournie. La dernière vue de carte
reste mémorisée comme avant ; le repère lui-même reste dans l’onglet.

## Services et confidentialité

Leaflet et sa licence sont locaux. Internet sert aux tuiles OpenStreetMap standard
et au calcul public [FOSSGIS / OSRM](https://routing.openstreetmap.de/about.html).
Le fond OpenStreetMap France reste disponible comme secours manuel. Si le fond
est lent ou indisponible, **Changer de fond** remplace la couche sans modifier les
séances, le trajet ou le repère de position. **Réessayer** garde le fond courant.
Les tuiles sont demandées après le déplacement et à la fin du zoom, en respectant
le cache normal du navigateur. Le fond standard suit les
[conditions d’utilisation OSM](https://operations.osmfoundation.org/policies/tiles/),
sans préchargement ni téléchargement massif.
Profils à pied et à vélo, sans clé API. Calculs volontaires, espacés d’au moins
1,1 seconde, annulables, avec délai de 15 secondes. Aucun calcul en arrière-plan.

Les coordonnées A/B sont envoyées au fournisseur pour le calcul. Celui-ci reçoit
aussi les informations normales d’une requête web, comme l’adresse IP. Nom,
durée, cadence et journal ne sont pas envoyés. La géométrie reçue est conservée
dans la séance et réutilisée sans recalcul. Les tuiles de la vue affichée sont
mises en cache par le navigateur. Aucun téléchargement de carte hors ligne.

Ces services communautaires peuvent être indisponibles, sans garantie de
service. Les erreurs et nouvelles tentatives sont explicites. Le carnet et la
saisie libre restent accessibles sans fond de carte. Attributions, fournisseur
et lien de correction de la carte sont visibles.

## Sauvegardes

Stockage local, clé `workouts`, propre à l’adresse et au port. Passer de
`127.0.0.1` à `localhost` ou changer de navigateur utilise un autre stockage.
Exporter pour transférer les séances ou prévenir un effacement. Pas de compte
ni de synchronisation.

Export JSON version 2 avec les trajets. Import : version 2, version 1 et tableaux
du cours. Les identifiants existants gardent leur version locale. Un fichier
invalide est rejeté en entier. Limites : 20 Mo, 10 000 séances, 20 000 points par trajet.

Un historique illisible reste intact et peut être récupéré brut avant une
réinitialisation confirmée. Si le stockage échoue, les changements restent dans
l’onglet, avec un message demandant d’exporter avant de fermer.

## Vérifier la logique

```sh
node --test tests/*.test.mjs
```

Tests natifs Node.js sans installation : calculs, dates, décimales françaises,
anciens historiques, imports, filtres, profils A/B, géométrie, annulation et réseau.
Voir `VERIFICATION.md` pour les essais navigateur et leurs limites.

## Crédits et conditions d’origine

Base **Mapty © Jonas Schmedtmann**, issue de
`complete-javascript-course-master/15-Mapty/final`. Le cours reste intact.
`COURSE_README.md` conserve la documentation fournie.

Contributions personnelles : français, composition mobile dédiée, journal daté,
gestion des séances, bilans, filtres, sauvegardes, calcul A/B, conservation du
tracé et gestion des erreurs.

Le dossier fourni ne contient pas de LICENSE séparé. Aucune nouvelle licence
n’est attribuée au code original. Sa mention est conservée dans le code,
l’interface et ici :

> Use for learning or your portfolio. Don't use to teach. Don't claim as your own.

Voir la FAQ Q8 dans `COURSE_README.md`. Présenter le travail comme une adaptation
personnelle en distinguant ses propres contributions.

- Leaflet : BSD-2-Clause, licence inchangée dans `vendor/leaflet/LICENSE`.
- Manrope, plus chargée par cette version : licence conservée dans `vendor/fonts/OFL.txt`.
- Carte : contributeurs OpenStreetMap ; fond standard OpenStreetMap, secours OpenStreetMap France.
- Itinéraires : FOSSGIS / OSRM, données OpenStreetMap.

## Publication GitHub Pages

- Dépôt : <https://github.com/v2r2y2/mapty-portfolio>
- Site : <https://v2r2y2.github.io/mapty-portfolio/>
- Source de publication : branche `main`, dossier racine, fichiers statiques
  servis directement grâce à `.nojekyll`. Aucun framework ni compilation.

Après une modification validée, un push de `main` déclenche une nouvelle
publication GitHub Pages. Le cours original et les licences restent préservés.
Les séances locales ne sont pas transférées automatiquement vers le site :
exporter depuis la version locale puis importer sur le site publié si nécessaire.
