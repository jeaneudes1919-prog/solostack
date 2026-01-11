# 🚀 SoloStack - Marketplace Premium pour Créateurs Indépendants

SoloStack est une plateforme e-commerce moderne et performante, conçue pour offrir une expérience d'achat fluide et une gestion simplifiée pour les vendeurs. La plateforme met l'accent sur l'excellence artisanale et le design haut de gamme.

**🔗 Lien du projet en ligne :** [https://solostack-swart.vercel.app/](https://solostack-swart.vercel.app/)

## 🌟 Points Forts du Projet

- **Architecture Cloud-Native** : Backend optimisé pour Render avec gestion des images par flux (streams) vers Cloudinary (zéro stockage local pour une scalabilité maximale).
- **Interface Ultra-Fluide** : Animations complexes et transitions fluides réalisées avec Framer Motion.
- **Gestion Stricte des Stocks** : Système de verrouillage au niveau du panier pour empêcher de commander au-delà des stocks réels des variantes.
- **Expérience Utilisateur (UX)** : Design responsive "Mobile-First" avec menus et boutons adaptés aux smartphones.

## 🛠 Stack Technique

### Frontend
- **React.js (Vite)** : Pour une interface rapide et réactive.
- **Tailwind CSS** : Design système moderne et responsive.
- **Zustand** : Gestion d'état global avec persistance du panier (LocalStorage).
- **Framer Motion** : Animations haut de gamme.
- **Lucide React** : Iconographie épurée.

### Backend
- **Node.js & Express** : Serveur API REST.
- **PostgreSQL (Neon DB)** : Base de données relationnelle robuste.
- **Cloudinary** : Hébergement et optimisation dynamique des images.
- **JWT (JSON Web Tokens)** : Authentification sécurisée des utilisateurs et vendeurs.
- **Streamifier** : Gestion des uploads sans fichiers temporaires sur le serveur.

## 🚀 Fonctionnalités principales

### 🛒 Pour les Clients
- **Navigation par catégories** : Exploration visuelle des produits.
- **Détails produits riches** : Sélection de variantes (couleurs, tailles) avec mise à jour du stock en temps réel.
- **Panier intelligent** : Calcul automatique des totaux et persistance des données.
- **Avis vérifiés** : Système de notation réservé aux clients ayant réellement acheté le produit.

### 🏪 Pour les Vendeurs
- **Gestion de catalogue** : Ajout, modification et suppression de produits avec variantes.
- **Upload d'images** : Envoi direct vers Cloudinary avec redimensionnement automatique.
- **Tableau de bord** : Suivi simplifié de la boutique.

