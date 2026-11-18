# Contrats de réorganisation responsive

Ce document définit les règles de l’accueil, de la connexion et du carnet.
La matrice indique les contrôles exécutés dans Chromium redimensionné ; les
preuves sont conservées dans `verification-responsive.json`. Les contrôles de
zoom et de texte listés séparément restent à exécuter. Aucun test sur appareil
physique n’est revendiqué.

## Règles communes

- Adapter l’ordre, les colonnes, les zones de défilement et la navigation au contenu
  disponible ; ne pas obtenir la petite largeur en réduisant tout l’écran bureau.
- Conserver le texte et l’action avant le visuel dans l’ordre de lecture de
  l’accueil. Dans chaque fonctionnalité, le texte précède sa capture en lecture
  linéaire ; l’alternance visuelle sur grande largeur n’altère pas cet ordre.
- Conserver des cibles interactives d’au moins 44 px, des champs d’au moins 16 px
  de corps, un focus visible et des libellés lisibles. Les actions principales de
  présentation et les champs de connexion disposent de 48 px de hauteur minimum.
- Aucun débordement horizontal de page, recouvrement de commandes, texte tronqué
  nécessaire à une tâche ou réduction de police pour faire entrer une grille.
  Les panneaux et images doivent pouvoir rétrécir sans imposer leur largeur native.
- Conserver les légendes et les attributions des captures ; chaque image garde
  son ratio. Les exemples ne deviennent pas des données du carnet visiteur.

## Passages déterminés par la place nécessaire

| Largeur CSS disponible | Accueil et connexion | Carnet |
| --- | --- | --- |
| Moins de 650 px | Une colonne ; texte/action avant le hero visuel. `picture` / `source` sélectionne `assets/carnet-mobile.png`, vraie capture du journal mobile. Aucune capture bureau miniaturisée dans ce hero. Fonctionnalités texte puis capture, aperçus limités à 260 px. Connexion : formulaire direct, sans illustration A/B. | Journal, carte et éditeur sont des écrans séparés. Navigation basse Journal / Carte / Ajouter ; elle disparaît pendant saisie et choix A/B. Le pied d’enregistrement reste accessible dans la composition de l’éditeur. |
| 650 à 1049 px | Lecture limitée, titre et aperçu principal empilés ; marges intérieures de 40 px. Fonctionnalités en deux colonnes lisibles avec écart de 32 px. Connexion limitée à 420 px, sans illustration. | Écrans séparés ; lecture centrée autour de 620 px et formulaire autour de 580 px, marges d’au moins 32 px. Panneau A/B limité à 440 px. |
| 1050 à 1059 px | Composition compacte précédente : hero empilé et connexion sans illustration. | Journal de 410 px et carte en parallèle ; navigation dans l’en-tête. |
| Dès 1060 px | Hero avec colonne texte de 340 px, écart de 56 px et aperçu fluide ; conteneur limité à 1240 px. Fonctionnalités à deux colonnes avec écart de 80 px ; trajet en alternance visuelle. Sauvegarde en deux colonnes. Connexion : colonne papier A/B et formulaire limité à 380 px. | Composition parallèle précédente ; choix A/B donne toute la largeur à la carte, panneau limité à 390 px et 72 % de hauteur. |
| Dès 1450 px | Conteneur de présentation toujours plafonné ; pas d’agrandissement illimité des lignes de texte ou des captures. | Journal de 450 px et marge intérieure de 38 px. |

Le visuel principal est une composition adaptée, pas un bureau miniaturisé :
capture du journal à 390×844 sous 650 px, capture tablette à 768×844 de 650 à
1059 px, puis capture bureau à partir de 1060 px. `picture` sélectionne la bonne
source et la CSS réserve son ratio. Les captures mobile et tablette proviennent
du journal réellement rendu dans ces formats, avec des séances d’exemple.

Les seuils 1050 et 1060 px répondent à des compositions différentes. Le premier
permet au carnet d’associer journal et carte ; le second donne au hero sa colonne
texte de 340 px, son écart et une image encore lisible, et permet à la connexion
d’afficher une seconde colonne. Leur différence de 10 px est volontaire : il faut
vérifier cet intervalle plutôt que forcer un seuil commun à toutes les pages.

La tablette n’est pas une réduction du bureau : le carnet garde des écrans dédiés,
le hero reste empilé et la connexion va directement à sa tâche. Les deux colonnes
des fonctionnalités ne sont valides que si leurs textes et captures restent
lisibles ; une correction éventuelle doit réorganiser la grille, pas réduire la
police. Les seuils décrivent des largeurs CSS disponibles, pas des appareils fixes.

## Mouvement et changement de largeur

L’accueil reste sans mouvement d’ambiance. Le diagramme A/B est réservé à la
connexion dès 1060 px : une seule lecture de 2700 ms par chargement, sans relance
au retour d’onglet (`hasPlayed`). Le passage en largeur compacte ou en mouvement
réduit annule l’animation ; le tracé reste statique. Le carnet supprime ses
transitions et ses animations Leaflet avec la préférence de mouvement réduit.

## Matrice de validation

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
- Agrandissement du texte à 200 % : vérifier les libellés longs, l’en-tête,
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
