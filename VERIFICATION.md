# Vérification locale — 18 novembre 2026

## Contrôles terminés

- `node --test tests/workouts.test.mjs` : 10 tests réussis.
- Même suite avec `TZ=Europe/Paris` : 10 tests réussis, y compris les bornes
  hebdomadaires lors du changement d’heure et au passage d’année.
- Vérification de syntaxe de `script.js` et `workouts.mjs` réussie.
- Parcours dans un profil Chromium de test isolé : ajout français, virgule,
  validation négative, édition du sport/des valeurs/de l’emplacement avec
  conservation de l’identifiant, marqueur synchronisé, rechargement, filtres,
  export JSON puis réimport sans doublon, fichier invalide rejeté sans changement,
  suppression annulée puis confirmée et persistée, saisie validée avec Entrée.
- Reprise dans le navigateur d’un historique de l’ancienne version, avec
  conservation de l’identifiant et affichage français.
- Simulations : localisation refusée, localisation sans réponse et récupération
  au bout du délai applicatif, tuiles indisponibles, historique illisible conservé,
  échec de sauvegarde locale signalé avec export toujours accessible.
- La correction de retour de localisation a été revue indépendamment :
  message lisible près de la carte sur téléphone, sans modifier l’état des tuiles.
- Géométrie à 390, 768, 1280 et 1440 px : aucune largeur de page supplémentaire ;
  carte de largeur positive à chaque format. Contrôle visuel du journal, du
  formulaire, de son erreur et des messages de localisation.
- Aucun appel automatique à la géolocalisation au démarrage ; aucun téléchargement
  de police, JavaScript ou CSS depuis un serveur tiers. Les tuiles restent externes.
- Les fichiers du cours original ont été comparés par empreintes avant/après.

## Mesure de démarrage et limites

Un essai local avec position simulée retardée de 1,5 seconde a observé la création
du conteneur de carte vers 1606 ms dans la version d’origine et 22 ms dans cette
version. Cette mesure démontre la suppression de l’attente de géolocalisation ;
ce n’est ni un temps de chargement complet ni une garantie sur un autre appareil.
Le chargement et le rendu des tuiles dépendent encore du réseau et du fournisseur.

Les essais mobiles sont des vues Chromium redimensionnées. Aucun essai sur
iPhone/Android physique, Safari ou lecteur d’écran n’est revendiqué. La position
réelle de l’utilisateur n’a pas été utilisée. Les séances des captures sont
des données de test ; aucune n’est injectée dans le journal de l’utilisateur.

Le moteur automatique Impeccable étant indisponible, la qualité a été contrôlée
par inspection des rendus, mesure des contrastes et relecture indépendante.
Aucun push ou déploiement n’a été effectué.
