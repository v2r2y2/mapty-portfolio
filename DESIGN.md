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

L’extension d’accueil conserve ce système : présentation et action dans un mode Persuade sobre validé ; connexion et carnet en mode Operate. ENERGY 1 / RHYTHM 2 sur ces surfaces, MOTION 1 pour l’accueil et le carnet, MOTION 2 uniquement pour le diagramme A/B de connexion. Les variations de composition répondent aux tâches et aux dimensions disponibles. Le contenu réel, la carte utilitaire et les lignes du journal portent l’identité ; le mouvement reste un retour d’action ou une explication ponctuelle.

**Key Characteristics:**
- Palette claire et un accent vert de fonction.
- Police système, métriques à chiffres tabulaires.
- Téléphone, tablette et bureau disposent de compositions distinctes.
- Motif A/B et aperçus SVG issus de la géométrie enregistrée.

Documentation fusionnée par lecture directe de `index.html`, `connexion.html`,
`journal.html`, `credits.html`, `style.css`, `accueil.css`, `script.js`,
`connexion.js` et `assets/README.md`. Aucun extracteur automatique Impeccable n’a été exécuté ; ce document
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

- `index.html` est la vraie page d’accueil : en-tête, titre et aperçu du carnet,
  explication du trajet, explication du carnet, sauvegarde et pied de page.
  L’action principale « Essayer sans compte » mène à `journal.html` ; le lien
  « Se connecter » mène à `connexion.html`.
- `connexion.html` annonce les comptes non activés, conserve ses champs et son
  bouton de connexion désactivés et propose la même entrée sans compte.
  `credits.html` rassemble les crédits et attributions.
- `journal.html` conserve l’application, `script.js` et son stockage navigateur ;
  le menu Options propose « Accueil » vers `index.html`. Il n’y a ni compte,
  ni synchronisation, ni nouveau backend ou framework dans cette extension.
- Le contenu de présentation défile dans la page, dans un conteneur de 1240 px
  maximum avec marges intérieures de 24 px, puis 40 px dès 650 px.
- Sous 650 px : texte et action avant le visuel, sections empilées avec texte avant
  capture. Le hero utilise une vraie capture du journal mobile via `picture` /
  `source` (`assets/carnet-mobile.png`), et non le bureau réduit. Les aperçus de
  fonctionnalités sont limités à 260 px ; la connexion
  affiche directement le panneau de formulaire et masque la colonne A/B.
- Dès 650 px : sections trajet et carnet sur deux colonnes, écart de 32 px ;
  le titre et l’aperçu principal restent empilés. Le formulaire atteint au plus
  420 px et sa colonne narrative reste masquée.
- De 650 à 1059 px, l’aperçu principal utilise `assets/carnet-tablette.png`,
  capture du vrai journal à 768×844. Le ratio est réservé en CSS. À partir de
  1060 px, le visuel bureau remplace les sources compactes.
- Dès 1060 px : titre et aperçu principal en deux colonnes (340 px et largeur
  restante, écart de 56 px) ; sections à écart de 80 px et alternance de la section
  trajet ; sauvegarde en deux colonnes. La connexion révèle sa colonne papier
  avec diagramme A/B et un formulaire de 380 px maximum.

Les seuils sont liés à deux besoins différents : 1050 px libère l’espace du
journal et de la carte en parallèle ; 1060 px réserve assez d’espace au titre
d’accueil de 340 px, à son écart et à son aperçu fluide. De 1050 à 1059 px, le
carnet est donc en composition bureau et l’accueil reste empilé ; la connexion
conserve son formulaire seul. Les contrats et la matrice de validation à renseigner
par des preuves figurent dans `docs/RESPONSIVE.md`.

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
- **Aperçus :** captures réelles de l’adaptation locale avec données de
  démonstration, bord fin et coins de 8 px, légende visible et texte alternatif.
  `assets/carnet-apercu.png`, `assets/trajet-exemple.png` et
  `assets/seance-exemple.png`, ainsi que l’aperçu mobile
  `assets/carnet-mobile.png`, sont documentés dans `assets/README.md` : captures
  du 18 novembre 2026 à partir de séances de test à Abidjan, sans données privées,
  sans ajout au carnet des visiteurs. Les attributions restent visibles.
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
  le diagramme reste statique dès le départ. L’accueil n’a pas de mouvement d’ambiance.

Avec mouvement réduit, les transitions CSS sont supprimées et Leaflet désactive
ses animations de zoom et fondu. Aucun mouvement d’ambiance n’est ajouté.

## Do's and Don'ts

### Do:
- Do partir du contenu réel.
- Do garder A/B et le sport explicites.
- Do conserver erreurs, commandes de zoom et attributions visibles.
- Do employer des SVG pour le chevron et l’inversion A/B.
- Do légender les captures de démonstration et conserver leur provenance.
- Do rendre explicite l’indisponibilité des comptes et maintenir l’entrée sans compte.

### Don't:
- Don’t compresser le bureau sur téléphone.
- Don’t inventer un trajet en cas d’échec.
- Don’t présenter le parcours planifié comme du GPS enregistré.
- Don’t réintroduire la direction anthracite/Manrope.
- Don’t transformer l’animation explicative de connexion en boucle ou en mouvement d’ambiance.
- Don’t promettre de compte activé ou de synchronisation automatique.
