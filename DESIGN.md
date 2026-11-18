---
name: Mapty — journal sportif
description: Un journal conservant l’identité du Mapty d’origine.
colors:
  primary: "#00c46a"
  running-text: "#40e599"
  cycling: "#ffb545"
  surface: "#2d3439"
  surface-raised: "#42484d"
  text: "#f3f6f5"
  secondary-text: "#bfc9cd"
  line: "#566168"
  error: "#ffb9b0"
typography:
  heading:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(23px, 2vw, 28px)"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  field: "6px"
  control: "7px"
  panel: "12px"
spacing:
  small: "8px"
  medium: "16px"
  large: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#102e20"
    rounded: "{rounded.control}"
    padding: "10px 13px"
  button-surface:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 13px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 9px"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "#50130c"
    rounded: "{rounded.control}"
    padding: "10px 13px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "9px 10px"
  workout:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "16px"
---

## Overview

**Creative North Star: "Un journal sportif clair, fidèle à Mapty."**

L’identité est conservée : logo Mapty, Manrope, surfaces anthracite, vert pour
la course et ambre pour le vélo. Le journal sert à enregistrer une séance,
la retrouver et comprendre son bilan.

## Colors

Le vert distingue l’action principale ; sa variante claire porte les libellés
de course et les actions textuelles sur les surfaces sombres. L’ambre identifie le vélo
et le focus clavier. Le nom du sport accompagne toujours sa couleur.
Les erreurs utilisent un texte saumon sur les surfaces sombres.

## Typography

Manrope est distribuée localement avec une police de secours pendant le chargement.
Titres courts, libellés français explicites et chiffres tabulaires pour les mesures.
Sous 421 px, le corps, les champs et les sélecteurs utilisent une taille de 16 px.
Le titre principal varie avec la largeur ; les mesures utilisent des chiffres tabulaires.

## Layout

Sous 1050 px, journal et carte se suivent verticalement. Sur ordinateur, le journal
occupe une colonne de 470 px défilant indépendamment ; la carte utilise le reste.
Le lien du formulaire et le bouton de sélection du centre relient les deux zones
sur téléphone. Dans cette disposition verticale, la carte garde une hauteur minimale
de 340 px, puis 440 px à partir de 700 px. Dès 1050 px, elle occupe la hauteur
disponible sous sa barre d’outils ; sa hauteur minimale est alors remise à zéro.

## Elevation & Depth

Les regroupements utilisent les surfaces, l’espacement et de fins séparateurs.
L’état de chargement est posé sur la carte avec une ombre légère. Le dialogue
protège la confirmation de suppression sans interrompre la saisie normale.

## Shapes

Panneaux et fiches à coins arrondis ; contrôles compacts rectangulaires.
Les sports et les états sont exprimés par des mots.

## Components

- Action principale verte pour enregistrer ou ouvrir la saisie ; actions secondaires
  transparentes ou sur surface, et confirmation destructive saumon.
- Fiches avec sport, date, quatre mesures et actions voir, modifier, supprimer.
- Formulaire intégré avec libellés associés, champs à coins de 6 px, bordure
  saumon en cas d’erreur et explications à proximité des champs.
- Bilan hebdomadaire indépendant des filtres de la liste, avec période explicite.
- Fond de carte non bloquant, état d’erreur et action pour réessayer.
- Confirmation native avec Annuler par défaut pour une suppression.
- Focus ambre visible ; boutons, champs et sélecteurs hauts d’au moins 44 px.
  Les boutons répondent par une transition de fond de 150 ms, désactivée quand
  une réduction du mouvement est demandée.

## Do's and Don'ts

### Do:

- Préserver le logo, la typographie et la correspondance des couleurs avec les sports.
- Afficher les erreurs et les restrictions de sauvegarde près des actions.
- Conserver l’accès au journal sans localisation et sans fond de carte.
### Don’t:

- Ne pas ajouter de framework, de page marketing ou de fonctions sociales.
- Ne pas prétendre enregistrer un trajet GPS ni synchroniser les données.
