# Contrats de réorganisation responsive

Ce document définit les règles de l’accueil, de la connexion et du carnet. La dernière correction de l’accueil remplace les captures par une démonstration SVG et une séance HTML. Les nouveaux contrôles de l’accueil sont séparés des essais historiques du carnet et de la connexion. Aucun test sur appareil physique n’est revendiqué.

## Règles communes

- Adapter ordre, colonnes, défilements et navigation à la place disponible, sans miniaturiser un écran bureau.
- À l’accueil, conserver copie et action avant la démonstration dans l’ordre de lecture ; la séance liée suit le trajet. Le SVG et les métriques HTML restent lisibles sans capture intermédiaire.
- Conserver des cibles d’au moins 44 px, des champs d’au moins 16 px, un focus visible et des libellés lisibles. L’action principale et les champs de connexion gardent 48 px de hauteur minimum.
- Aucun débordement horizontal de page, recouvrement de commandes, texte utile tronqué ou réduction de police pour faire entrer une grille. Les panneaux peuvent rétrécir.
- Conserver A/B, unités, sources et attributions. Le changement de sport actualise tracé, distance et séance. L’exemple n’est pas ajouté au carnet du visiteur ; son téléchargement fournit un JSON version 2 compatible avec l’application.

## Passages déterminés par la place nécessaire

| Largeur CSS disponible | Accueil et connexion | Carnet |
| --- | --- | --- |
| Moins de 650 px | Copie/action puis démonstration empilées ; scène de 244 px, lecture A/B + distance sur deux colonnes ; métriques de séance sur deux colonnes, allure/vitesse en pleine largeur. Connexion : formulaire seul. | Journal, carte et éditeur séparés ; navigation basse masquée pendant saisie et choix A/B. Pied d’enregistrement accessible dans l’éditeur. |
| 650 à 1049 px | Hero empilé, scène de 310 px ; section carnet/démonstration en deux colonnes avec 40 px d’écart, métriques sur trois colonnes. Marges intérieures de 40 px. Connexion limitée à 420 px sans illustration. | Écrans dédiés ; lecture autour de 620 px, formulaire autour de 580 px, marges d’au moins 32 px. Panneau A/B limité à 440 px. |
| 1050 à 1059 px | Même composition empilée et scène de 310 px ; connexion sans colonne A/B. | Journal de 410 px et carte en parallèle ; navigation d’en-tête. |
| Dès 1060 px | Hero 340 px + démo fluide, écart de 56 px ; scène de 300 px. Section carnet 340 px + reste, écart de 56 px. Bande de sauvegarde compacte. Connexion : colonne papier A/B, formulaire limité à 380 px. | Composition parallèle ; choix A/B sur toute la carte, panneau limité à 390 px et 72 % de hauteur. |
| Dès 1450 px | Conteneur toujours plafonné à 1240 px ; aucune extension illimitée des lignes ou de la scène. | Journal de 450 px, marge intérieure de 38 px. |

Le conteneur conserve 24 px de marges intérieures sous 650 px, puis 40 px. Le SVG représente la géométrie précalculée : il ne dépend ni d’une image de bureau réduite ni d’une sélection `picture`/`source`. Les anciennes captures restent des archives et ne définissent plus le contrat de présentation.

La scène réserve sa hauteur avant chargement. Le choix sportif, le tracé et sa distance restent proches pour que la conséquence de l’action soit lisible. La séance HTML prolonge cette relation ; la bande de sauvegarde évite une section longue sans nouvel usage. Les seuils 1050 px du carnet et 1060 px de la présentation servent des compositions différentes ; vérifier leur intervalle. Les largeurs désignent l’espace CSS disponible, pas des appareils fixes.

## Mouvement et changement de largeur

L’accueil dessine son tracé pendant 1800 ms une fois à sa visibilité initiale, puis sur action de changement de sport, ouverture de carte ou replay. Aucune boucle ni mouvement d’ambiance. La préférence de mouvement réduit annule l’animation et conserve le trajet statique. La carte est chargée à la demande explicite : Leaflet 1.6 local puis tuiles OSM ; un redimensionnement recadre le trajet sans animation.

La connexion conserve une seule lecture A/B de 2700 ms dès 1060 px, sans relance au retour d’onglet (`hasPlayed`). Le passage en largeur compacte ou en mouvement réduit annule l’animation. Le carnet supprime ses transitions et animations Leaflet avec mouvement réduit.

## Matrice de validation

### Accueil interactif courant

Preuve : `verification-accueil-interactif.json`, Chromium redimensionné.

| Largeurs CSS testées | Résultat observé |
| --- | --- |
| 320, 390, 649 px | Hero empilé, scène 244 px, métriques sur deux colonnes ; aucun débordement ; choix vélo met à jour la séance |
| 650, 768, 1049, 1050, 1059 px | Hero empilé, scène 310 px, métriques sur trois colonnes ; aucun débordement ; même interaction active |
| 1060, 1280, 1450, 1672 px | Hero en deux colonnes, scène 300 px, conteneur plafonné ; aucun débordement ; même interaction active |

La carte ouverte a été redimensionnée à 320, 768, 1672 et 390 px : les deux repères restent dans la scène. Les contrôles de géométrie utilisent des tuiles bloquées pour éviter des requêtes répétées ; une ouverture séparée a chargé huit vraies tuiles OSM. Mouvement réduit testé ; aide de sauvegarde ouverte et focus clavier visible. Le texte à 200 % à 390 px n’a pas provoqué de débordement horizontal. Aucun PNG de présentation n’est chargé dans le contenu de l’accueil. Zéro exception applicative pendant ces essais.

### Historique du carnet, de la connexion et de l’ancien accueil

**Version antérieure à captures.** Les mentions de sources mobile/tablette/bureau ci-dessous décrivent cette version antérieure, pas le contrat courant de l’accueil.

Pour chaque ligne : charger accueil, connexion et carnet, contrôler l’ordre de
lecture, la navigation, les débordements, le focus et les commandes accessibles.
Vérifier aussi un passage de largeur dans chaque sens. Dans le carnet, ouvrir
journal, carte, ajout, détail et choix A/B avec du contenu de démonstration.

| Largeur CSS | Point à contrôler | Preuve / résultat |
| --- | --- | --- |
| 320 px | Reflow étroit ; texte, cibles et actions sans débordement ; vrai hero mobile | PASS : source mobile, quatre pages sans débordement, éditeur/carte/détail/A-B accessibles |
| 390 px | Composition courante en une colonne ; champs et pied d’éditeur accessibles | PASS : source mobile, navigation basse, pied d’éditeur dans le viewport |
| 649 px | Dernière largeur avant passage ; hero mobile, formulaire direct | PASS : source mobile, aucune colonne narrative de connexion |
| 650 px | Première largeur des fonctionnalités à deux colonnes ; carnet dédié | PASS : source tablette, carnet et carte séparés |
| 768 px | Longueur de lecture limitée ; captures et texte lisibles | PASS : source tablette, lecture centrée, éditeur accessible |
| 1049 px | Dernière largeur de carnet à écrans séparés | PASS : carte masquée dans le journal, navigation basse présente |
| 1050 px | Carnet parallèle, accueil et connexion encore compacts | PASS : journal de 410 px avec carte, accueil empilé et connexion directe |
| 1059 px | Dernière largeur compacte de présentation ; pas d’illustration connexion | PASS : source tablette, aucune colonne narrative de connexion |
| 1060 px | Hero en deux colonnes, aperçu fluide, colonne A/B visible | PASS : source bureau, grille 340 px + espace + image, colonne A/B visible |
| 1280 px | Lecture et alignements de bureau ; conteneur de présentation plafonné | PASS : grille plafonnée, journal 410 px, navigation d’en-tête |
| 1450 px | Journal de 450 px, contenu de présentation sans étirement supplémentaire | PASS : journal de 450 px et conteneur d’accueil limité |

Quarante-quatre contrôles de pages, complétés par les états journal, ajout,
détail, carte et choix A/B à chaque largeur. Zéro exception applicative observée.
Les tuiles sont simulées pour ces contrôles géométriques afin d’éviter des
requêtes répétées aux services publics. Les captures de l’accueil utilisent les
vraies images locales, pas les tuiles de substitution.

### Zoom et texte

À exécuter et consigner séparément :

- Zoom navigateur à 200 % et 400 % : noter la largeur CSS effective, vérifier
  que la composition correspond à cette largeur, que le focus et les actions
  restent accessibles et qu’aucun défilement horizontal de page n’apparaît.
- Agrandissement du texte à 200 % : l’accueil à 390 px est contrôlé sans débordement ; poursuivre pour les autres pages, libellés longs, l’en-tête,
  les boutons, les légendes, les champs et les panneaux sans chevauchement.
- Passage autour de 649/650, 1049/1050 et 1059/1060 px avec texte agrandi :
  vérifier la réorganisation et l’accès aux mêmes tâches.
- Préférence de mouvement réduit activée avant chargement et changée en cours de
  session ; retour d’onglet et passage autour de 1060 px : aucune boucle ni relance
  du diagramme déjà joué.

Associer aux résultats la page, la largeur CSS, le zoom, le navigateur, une capture
et les actions vérifiées. Distinguer les constats de lecture du code des preuves
obtenues dans un navigateur ; ne pas transformer cette matrice en validation
acquise sans les observations correspondantes.
