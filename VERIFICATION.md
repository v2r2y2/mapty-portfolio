# Vérification locale · 18 novembre 2026

## Logique

`node --test tests/*.test.mjs` : **15 tests réussis**. Calculs de l’auteur,
décimales françaises, dates, modèles et sauvegardes anciennes, fusion sans
doublon, filtres/bilan, séances sans position, validation des trajets, profils
foot/bike, réponse NoRoute, géométrie invalide, rythme des requêtes et annulation.
Syntaxe des trois modules vérifiée.

## Navigateur Chromium isolé

- Ajout/édition, valeurs requises, cadence facultative, dénivelé négatif,
  titre échappé, suppression annulée et confirmée.
- Filtres sport/période, tris et réinitialisation, états vides ; options/crédits.
- Export téléchargé, réimport sans doublon, ancien tableau du cours, JSON
  invalide rejeté, ancien point unique conservé puis retiré.
- Vrai service FOSSGIS/OSRM : HTTP 200 à pied et à vélo. L’essai piéton navigateur
  a retourné **2 630,7 mètres et 77 coordonnées**. Ligne dessinée, distance
  renseignée, sauvegarde et réaffichage après rechargement.
- Erreur 503 simulée : message visible, pas de trajet inventé ; nouvelle
  tentative réelle réussie. Changement de sport avec A/B conservés, inversion,
  annulation d’une édition sans modifier l’ancien trajet enregistré.
- Sélection A/B au clavier et à la souris, déplacement d’un marqueur, effacement
  des points, annulation du choix, entrée depuis la carte bureau, deux zooms.
- Stockage illisible intact, téléchargement brut, réinitialisation annulée par
  Échap puis confirmée. Quota simulé : avertissement, fiche en mémoire et export
  accessible. Rechargement sans prétendre avoir enregistré les changements.
- Tuiles indisponibles simulées, message et bouton Réessayer ; localisation
  refusée, réussie et sans réponse avec récupération après 9 secondes.
- Navigation clavier, Échap pour options/dialogues/retour, focus visible,
  transitions supprimées en mouvement réduit.
- **Zéro exception JavaScript applicative** dans les deux parcours complets.
  Des erreurs réseau de tuiles ont été observées, puis la carte entièrement
  chargée a été capturée ; elles restent dépendantes du fournisseur et du réseau.

## Rendus et chargement

Journal, saisie et fiche contrôlés à **320, 390, 650, 768, 1 024, 1 050,
1 280 et 1 440 px** : aucun débordement horizontal. Bouton de sauvegarde dans
le viewport. Titre de 80 caractères contrôlé à 320 px.

Captures observées : bureau chargé 1 440×900, journal/saisie/trajet/fiche à
390×844 et tablette 768×900. Les séances des captures sont explicitement des
données de test dans un profil distinct, jamais injectées dans le journal utilisateur.

Au démarrage du journal mobile : **zéro appel de géolocalisation et aucune
ressource externe** dans les requêtes observées. Carte créée à son ouverture.
Police système. Aucun chiffre de gain de vitesse ou garantie de délai de
chargement complet n’est revendiqué.

Contrastes texte : encre/blanc 14,97:1 ; secondaire/blanc 5,95:1 ; secondaire/papier
5,44:1 ; blanc/vert 7,92:1 ; placeholder/blanc 5,00:1 ; erreur/blanc 7,09:1.
Ces mesures ne constituent pas une certification globale d’accessibilité.

## Limites et intégrité

Vues Chromium redimensionnées, sans téléphone physique, Safari ou lecteur
d’écran. Les essais de service utilisent des coordonnées publiques d’Abidjan,
sans la position réelle de l’utilisateur. Le parcours calculé ne prouve pas
qu’un chemin est praticable au moment de la sortie.

Les 19 fichiers du cours original ont été comparés à leurs empreintes avant
travail : identiques. Licences et conditions d’origine conservées. Dépendances
du projet inchangées, sans framework. Aucun push ni hébergement.

Le détecteur automatique Impeccable n’a pas démarré : moteur 0.1.18 absent et
cache non accessible. Vérification de rendu directe et revue indépendante
effectuées ; ne pas présenter cela comme un succès du détecteur automatique.

La revue indépendante a demandé une correction ciblée des icônes. Après
remplacement de deux glyphes par des SVG et nouvelles captures, elle a noté
le correctif « resolved », disposition « ship » ; les conclusions de la revue
complète restent inchangées. Le verdict de correction porte sur cet écart.

La copie réellement servie à `http://127.0.0.1:8080/` a ensuite été vérifiée :
nouvelle police et ressources `carnet-3`, journal mobile sans carte affichée,
aucun débordement, ajout/rechargement/suppression d’une séance temporaire et
ouverture du choix A/B. Zéro exception applicative, journal de test revenu à
son état initial. Les sources applicatives copiées sont identiques à celles
des essais complets.

## Correction du fond de carte et repère de position

Le 18 novembre, même vue Chromium 1440×900 et vingt images : le fond HOT France
n’avait chargé que 8 images après environ 57 secondes (images terminées entre
19 et 52 secondes). Le fond standard OpenStreetMap a chargé 20/20 images en
3,95 secondes dans l’essai suivant. Comparaison ponctuelle, pas un benchmark
répété ni une garantie de disponibilité. Aucun préchargement ou cache forcé.

Repère bleu et cercle de précision contrôlés sur bureau et mobile, avec des
coordonnées publiques simulées à Abidjan. Aucun usage de la position réelle de
l’utilisateur. Contrôles : absence d’appel automatique, demande de position
fraîche, précision 25 m et position approximative à 5 km, précision absente,
refus, délai de neuf secondes et réponse arrivée trop tard.

Le point reste indépendant de A/B, de l’effacement et de la saisie d’un trajet.
Une nouvelle demande remplace le repère, sans doublon. Un échec retire l’ancien
repère afin de ne pas le présenter comme une nouvelle position. Pas de suivi
continu. Les tuiles d’erreur et le secours manuel ont été simulés ensuite pour
éviter les requêtes répétées aux services publics ; attributions et couche
unique vérifiées. Zéro exception applicative dans ce parcours.

La localisation réelle et les appareils physiques restent à valider par le
propriétaire ; les captures de position sont des démonstrations de test.

## Accueil complet intégré

Accueil, connexion et crédits contrôlés à 320, 390, 650, 768, 1050 et 1440 px :
18 cas sans débordement. Captures bureau/mobile observées. L’accueil ne charge
aucune ressource externe et ne demande pas la position. Ses images sont des
captures locales, avec exemples signalés ; elles ne peuplent pas le journal.

Les quinze tests natifs passent. Un ancien historique au format tableau a été
posé dans un profil de test avant l’ouverture du carnet : il reste accessible
depuis `journal.html`, puis après création/rechargement/suppression d’une autre
séance et retour à l’accueil. Même origine, même clé `workouts`, pas de migration
ou effacement. Retour accueil disponible dans Options et la navigation bureau.

Parcours de connexion vers le carnet, page de crédits et aide à l’export testés.
Champs de connexion désactivés, indisponibilité annoncée avant les champs ;
aucun compte réel, aucune collecte d’identifiants. Le point bleu du carnet reste
fonctionnel avec géolocalisation simulée. Zéro exception applicative dans le
parcours de contrôle. Animation de 2,7 s, arrêt puis respect du mouvement réduit.
Un retour d’onglet ne doit pas relancer la séquence déjà jouée.

Règles consignées dans `docs/RESPONSIVE.md`, preuves dans
`docs/verification-responsive.json`. Onze largeurs : 320,390,649,650,768,1049,
1050,1059,1060,1280,1450 px. Quatre pages à chaque largeur, puis états journal,
ajout, détail, carte et choix A/B. Aucun débordement ni exception applicative.
Le hero sélectionne le vrai journal mobile sous650, le vrai journal tablette
de650à1059 et l’aperçu bureau dès1060, sans réduire tout le bureau sur téléphone.
Les captures finales ont été prises après chargement des images différées.
Zoom navigateur et agrandissement du texte restent explicitement à vérifier.
