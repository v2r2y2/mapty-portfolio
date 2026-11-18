---
name: "Mapty · Carnet de sorties"
description: "Carnet sportif clair et carte utilitaire, en français."
colors:
  paper: "#f5f5f0"
  surface: "#ffffff"
  ink: "#202923"
  muted: "#5d665f"
  line: "#dce0d9"
  accent: "#245b43"
  accent-hover: "#194833"
  tint: "#e8eee7"
  danger: "#a32d27"
  focus: "#98500e"
  position: "#1769d2"
  control-border: "#aeb7af"
typography:
  display-home:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  body-home:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 550
  button:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
rounded:
  control: "7px"
  group: "8px"
  panel: "10px"
  overlay: "14px"
spacing:
  s8: "8px"
  s12: "12px"
  s16: "16px"
  s20: "20px"
  s24: "24px"
  s32: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-text:
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    padding: "8px 4px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  button-entry:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
    height: "48px"
  account-notice:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    rounded: "{rounded.group}"
    padding: "16px"
  route-preview:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.group}"
    padding: "16px"
---

# Design System: Mapty · Carnet de sorties

## Overview

**Creative North Star: "Un carnet de sorties et une carte qui servent une tâche à la fois."**

Un carnet de sorties et une carte qui servent une tâche à la fois. L’interface claire emploie la police système, une encre sombre et un vert forêt pour les actions et les trajets. La direction anthracite/Manrope a été remplacée explicitement.

L’accueil associe Operate et Persuade par démonstration : changer de sport modifie le trajet, sa distance et la séance présentée. ENERGY 2 / RHYTHM 2 / MOTION 2 s’appliquent à cette surface. La connexion conserve Operate, ENERGY 1 / RHYTHM 2 / MOTION 2 pour son seul diagramme A/B ; le carnet conserve Operate, ENERGY 1 / RHYTHM 2 / MOTION 1. La géométrie et les chiffres rendent la relation entre action et résultat visible ; ils portent la persuasion sans décor supplémentaire.

La densité rassemble le choix, le trajet et sa lecture dans un panneau, puis la séance correspondante dans une section proche. L’aide de sauvegarde tient dans une bande compacte : elle accompagne la tâche sans prolonger artificiellement la page. Les captures de téléphone vides et les longues sections statiques ne servent plus de présentation.

**Key Characteristics:**
- Palette claire et un accent vert de fonction.
- Police système, métriques à chiffres tabulaires.
- Téléphone, tablette et bureau disposent de compositions distinctes.
- Motif A/B et aperçu SVG issu de vrais trajets précalculés ; séance HTML liée au sport choisi.

Documentation fusionnée par lecture directe de `index.html`, `connexion.html`,
`journal.html`, `credits.html`, `style.css`, `accueil.css`, `script.js`,
`connexion.js`, `accueil.js`, `assets/demo-routes.json` et `assets/README.md`. Aucun extracteur automatique Impeccable n’a été exécuté ; ce document
ne constitue pas un nouvel audit visuel. `PRODUCT.md` demeure la vérité produit.

## Colors

### Primary

Le vert forêt (`accent`) signale les actions principales, les liens, la sélection
sportive, le point B et les polylignes Leaflet. `accent-hover` fonce les boutons au
survol ; `tint` distingue les sélections et survols secondaires.

### Neutral

`surface` porte le carnet et les panneaux ; `paper` distingue le fond et les groupes.
`ink` porte la lecture principale, `muted` les dates, unités et aides. `line` sépare
les séances et les groupes ; `control-border` délimite les champs et boutons
secondaires.

Les couleurs fonctionnelles `danger` et `focus` servent respectivement les erreurs
et actions destructives, et l’anneau de focus visible. Les notifications de stockage
emploient en complément un fond ambre clair et une encre brune, sans changer
l’accent principal.

`position` (`#1769d2`) distingue le relevé géographique des trajets verts et des
repères A/B. Un point bleu bordé de blanc reste visible sur la carte ; le cercle
bleu translucide montre la précision annoncée, sans animation décorative. Le
texte donne l’heure et la précision sans dépendre uniquement de la couleur.
Les messages de chargement et de position s’empilent avec 8 px de séparation.
Pendant le choix A/B sur petit écran, leur zone défile pour ne pas recouvrir
le panneau de trajet.

## Typography

La même police système sert tous les rôles, sans téléchargement de police.
La hiérarchie normative est dans le frontmatter. L’accueil utilise un interligne
courant de 1,5, le carnet de 1,45. Le titre d’accueil passe de 2,5 rem à 3,5 rem
dès 650 px, puis 3,75 rem dès 1060 px ; sa hauteur de ligne reste de 1,1.
Le titre de connexion reste à 2 rem. Ces tailles de présentation ne remplacent pas
la hiérarchie plus dense du carnet. Les titres de section passent à
2 rem sur tablette (650–1049 px) ; le titre de formulaire utilise 1,125 rem.
Les dates et aides courantes utilisent 0,8125 rem, les unités et petites métadonnées
0,75 rem. Les métriques du bilan utilisent 1,55 rem et celles de la fiche 1,6 rem,
avec chiffres tabulaires. Les champs restent à 1 rem.

## Layout

### Accueil, connexion et crédits

- `index.html` rassemble titre/action, démonstration de trajet, séance HTML liée et aide de sauvegarde compacte. « Essayer sans compte » mène à `journal.html` ; « Se connecter » mène à `connexion.html`.
- `connexion.html` conserve les comptes non activés, ses champs et sa soumission désactivés et l’entrée sans compte. `credits.html` rassemble crédits et attributions.
- `journal.html` conserve l’application, `script.js` et son stockage navigateur ; Options propose « Accueil ». La démonstration ne modifie pas ce stockage.
- Le conteneur de présentation reste limité à 1240 px, avec marges intérieures de 24 px puis 40 px dès 650 px.
- Sous 650 px : copie et action précèdent la démonstration ; scène de 244 px, lecture A/B et distance sur deux colonnes. La séance présente deux colonnes de métriques et son allure/vitesse sur toute la largeur. La connexion montre directement le formulaire, sans colonne A/B.
- De 650 à 1059 px : hero empilé, scène de 310 px ; section carnet/démonstration en deux colonnes et métriques sur trois colonnes. La connexion reste limitée à 420 px, sans colonne narrative.
- Dès 1060 px : hero en deux colonnes de 340 px et largeur fluide, écart de 56 px ; scène de 300 px. La section carnet suit la même grille 340 px + reste avec 56 px d’écart. La bande de sauvegarde s’aligne selon l’espace disponible. La connexion révèle sa colonne papier A/B et un formulaire limité à 380 px.

Le SVG garde la géométrie lisible à chaque largeur ; il remplace les anciennes captures et leurs sélections `picture`/`source`. Les images anciennes restent des archives, sans rôle dans le contrat courant. La proximité entre choix sportif, tracé et chiffres permet de lire immédiatement la conséquence d’une action. La hauteur de scène est réservée pour éviter qu’un chargement déplace les commandes.

Les seuils répondent aux tâches : 1050 px libère journal et carte en parallèle ; 1060 px réserve assez de place au texte de 340 px, à la démonstration fluide et à la colonne de connexion. Entre ces seuils, le carnet est en composition bureau et l’accueil reste empilé. `docs/RESPONSIVE.md` distingue ce contrat des preuves à renouveler après cette correction.

### Carnet existant

Le corps occupe la hauteur disponible (`100dvh`, repli `100vh`). L’en-tête mesure
64 px, puis 76 px sur bureau. Les zones centrales ont leurs propres défilements.
Les espacements récurrents figurent au frontmatter ; il ne s’agit pas d’une grille
exclusive interdisant les ajustements locaux.

- Téléphone, moins de 650 px : un écran à la fois ; navigation basse Journal / Carte /
  Ajouter, hauteur minimale de 68 px et prise en compte de la zone sûre. La saisie
  et le choix A/B masquent cette navigation. Le formulaire possède un corps
  défilant et un pied d’enregistrement qui reste dans sa composition. Le panneau
  A/B occupe au maximum 56 % de la hauteur de carte, à 44 px du bas.
- Tablette, 650–1049 px : écrans dédiés ; lecture centrée dans environ 620 px,
  formulaire dans environ 580 px, marges minimales de 32 px. Panneau A/B limité
  à 440 px, aligné à droite et à 24 px du bas.
- Bureau, dès 1050 px : journal de 410 px et carte en parallèle ; navigation dans
  l’en-tête. Le choix A/B donne toute la largeur à la carte, avec panneau de
  390 px au maximum et hauteur plafonnée à 72 %.
- Grand bureau, dès 1450 px : journal de 450 px et marge intérieure de 38 px.
- Téléphone étroit, jusqu’à 360 px inclus : marges latérales du carnet et de
  l’en-tête réduites à 16 px, panneau A/B à 8 px des côtés.

## Elevation & Depth

L’accueil et la connexion restent plats, sans ombre ajoutée : traits séparateurs,
aperçus bordés et fond papier distinguent les séquences. Le carnet reste plat, séparé par des traits et des fonds tonaux. Les ombres
signalent uniquement les éléments au-dessus de la carte ou du contenu.

- Commandes et messages de carte : `0 3px 12px #20292318`.
- Sélection et notification : `0 4px 18px #2029231a`.
- Options : `0 8px 28px #2029231a`.
- Panneau A/B : `0 5px 22px #20292329`.
- Marqueurs de carte : `0 2px 6px #20292330`.

Le dialogue natif emploie un voile `#20292380` ; ses coins arrondis l’apparentent
au panneau A/B.

## Shapes

Les contrôles utilisent le rayon `control`, les groupes `group`, les panneaux
`panel` et les grandes superpositions `overlay`. Les lettres A/B sont circulaires :
28 px dans le motif vide, 25 px dans le sélecteur de points et 32 px sur la carte.
Les lignes de séance n’ont ni carte arrondie ni ombre.

## Components

- **Boutons :** principal plein, secondaire bordé, action textuelle soulignée.
  Minimum de 44 px ; déplacement actif de 1 px ; transition de fond de 120 ms et
  de déplacement de 100 ms, `ease-out`. Un contrôle désactivé passe à 45 % d’opacité.
- **Champs :** surface blanche, bord de 1 px, libellé et unité visibles. Une erreur
  rend le bord rouge et s’accompagne d’un texte associé. Le focus visible est un
  anneau de 3 px, décalé de 3 px, dans la couleur `focus`.
- **Choix sportif :** deux radios, libellés en segments indépendants de 46 px au
  minimum. La sélection combine fond teinté, bord vert et trait intérieur vert.
- **Navigation :** mobile en trois colonnes, cibles de 48 px, sélection teintée ;
  bureau en liens avec trait inférieur vert de 2 px sur la page active.
- **Journal :** lignes séparées, nom et date à gauche, distance à droite ;
  marges verticales de 20 px, survol clair. La fiche reprend les métriques en deux
  colonnes et un aperçu SVG du trajet réel quand il existe.
- **Trajet :** points A/B explicites, inversion par SVG et chevron d’ouverture par
  SVG, tous deux de 24 px. L’aperçu utilise la géométrie conservée, sans image
  distante. Le panneau flottant regroupe sport, points, message et action.
- **Formulaire :** écran dédié avec détails facultatifs repliables, erreurs
  proches des champs et action d’enregistrement dans le pied.

### Présentation et entrée sans compte

- **En-tête et pied de page :** marque existante et navigation simple ; en-tête
  d’au moins 76 px, liens d’au moins 44 px. Le pied de page revient à la ligne
  si nécessaire ; il porte le code du projet et les crédits.
- **Action d’entrée :** même vert forêt, rayon de 7 px, hauteur minimale de 48 px,
  marges intérieures de 11 px sur 20 px. Le focus conserve l’anneau de 3 px,
  décalé de 4 px sur les pages de présentation (3 px dans le carnet).
- **Démonstration de trajet :** SVG projeté depuis `assets/demo-routes.json` : 71 points / 2194,9 m à pied et 76 points / 2222 m à vélo, à Abidjan. Le choix sportif change géométrie, distance, titre, durée d’exemple et allure/vitesse de la séance HTML. A/B, la source FOSSGIS / OSRM et le caractère d’exemple restent explicites. Aucun appel de calcul d’itinéraire ni accès à la position du visiteur n’est nécessaire.
- **Carte à la demande :** « Afficher la carte » charge Leaflet 1.6 local et déclenche les tuiles OpenStreetMap après action explicite. Les commandes de zoom et les attributions restent visibles. Le SVG donne déjà un résultat avant cette demande ; les messages d’échec restent associés à la zone de démonstration.
- **Séance d’exemple :** métriques HTML sélectionnables et fichier JSON version 2 téléchargeable, contenant un workout compatible avec le carnet. Le téléchargement ne remplit pas le stockage du visiteur.
- **Tracé explicatif :** lecture de 1800 ms, une fois lorsque la scène devient visible, puis sur changement de sport, ouverture de carte ou « Rejouer le tracé ». Le tracé ne boucle pas. Le mouvement rend la géométrie perceptible et répond aux actions ; il n’anime pas le fond. Avec mouvement réduit, le tracé est statique et les animations Leaflet sont désactivées.
- **Aide de sauvegarde :** élément natif `details` / `summary` souligné ; il
  explique les commandes d’export et d’import du carnet, sans promettre de sync.
- **Compte indisponible :** notice sur fond papier associée au formulaire par
  `aria-describedby`, libellés visibles, vrais attributs `disabled` sur les champs
  et la soumission ; l’action utilisable reste le lien vers le carnet.
- **Diagramme de connexion :** schéma de principe A/B explicitement légendé,
  sans distance calculée. `connexion.js` anime A pendant 420 ms, dessine le trait
  pendant 2100 ms après 180 ms de délai, puis anime B pendant 420 ms à partir de
  2280 ms, soit 2700 ms au total. Une seule lecture par chargement, à partir de
  1060 px, sans boucle : `hasPlayed` empêche la relance lors d’un retour d’onglet
  ou d’un changement de largeur. Un changement de visibilité ou de préférence
  annule les animations en cours et rend le tracé statique. En mouvement réduit,
  le diagramme reste statique dès le départ. L’accueil ne possède aucun mouvement d’ambiance ; sa démonstration répond aux règles de tracé ci-dessus.

Avec mouvement réduit, les transitions CSS sont supprimées et Leaflet désactive
ses animations de zoom et fondu. Aucun mouvement d’ambiance n’est ajouté.

## Do's and Don'ts

### Do:
- Do partir du contenu réel.
- Do garder A/B et le sport explicites.
- Do conserver erreurs, commandes de zoom et attributions visibles.
- Do employer des SVG pour le chevron et l’inversion A/B.
- Do identifier les démonstrations, leurs sources et leur absence d’effet sur le carnet visiteur.
- Do rendre explicite l’indisponibilité des comptes et maintenir l’entrée sans compte.

### Don't:
- Don’t compresser le bureau sur téléphone.
- Don’t inventer un trajet en cas d’échec.
- Don’t présenter le parcours planifié comme du GPS enregistré.
- Don’t réintroduire la direction anthracite/Manrope.
- Don’t transformer l’animation explicative de connexion en boucle ou en mouvement d’ambiance.
- Don’t promettre de compte activé ou de synchronisation automatique.
