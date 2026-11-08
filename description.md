# Reservo

Plateforme de réservation de ressources (salles, matériel) construite comme projet de démonstration, avec un périmètre volontairement réduit et des fondations soignées.

## Présentation

Reservo permet à des utilisateurs de consulter un catalogue de ressources, de réserver un créneau et de le régler en ligne. Les administrateurs gèrent le catalogue.

Le projet met l'accent sur la qualité de conception : une API REST propre, une base de données qui garantit elle-même l'intégrité des données, des autorisations testées et un pipeline automatisé de la validation au déploiement.

## Fonctionnalités

**Utilisateur**
- Inscription, connexion et déconnexion
- Consultation des ressources (recherche, filtres, pagination)
- Réservation d'un créneau avec détection des conflits
- Paiement via Stripe Checkout (mode test)
- Consultation et annulation de ses propres réservations

**Administrateur**
- Création, modification et suppression des ressources

## Points techniques clés

- **Anti-chevauchement garanti par la base** : contrainte d'exclusion PostgreSQL (`EXCLUDE USING gist` sur `tstzrange`), validée par un test de réservations concurrentes.
- **Autorisations** : Laravel Policies appliquées sur chaque endpoint, chaque règle couverte par un test.
- **Paiement fiable** : webhook Stripe à signature vérifiée et idempotent. L'état « payé » ne dépend que du webhook.
- **Performance** : index justifiés par des requêtes réelles, optimisation documentée avec `EXPLAIN ANALYZE` avant/après.
- **Architecture claire** : controllers fins, Form Requests, API Resources, logique métier dans des Actions, statuts en Enums PHP.
- **Intégrité des données** : clés étrangères, contraintes `CHECK`, montants en centimes, dates en `timestamptz`.

## Stack

| Domaine | Technologies |
|---|---|
| Front-end | React, React Router, JavaScript, HTML, CSS |
| Back-end | PHP, Laravel, Laravel Sanctum |
| Base de données | PostgreSQL |
| API et intégration | API REST (`/api/v1`), Stripe |
| Qualité | Pest, Vitest, Pint, Larastan, ESLint, Prettier |
| Déploiement | Docker, GitHub Actions, déploiement cloud |

## Qualité et workflow

- Workflow Git par branches et Pull Requests, commits conventionnels
- CI : lint, analyse statique, tests back et front, build Docker
- Configuration entièrement par variables d'environnement
- Tests ciblés sur les zones à risque : authentification, autorisations, conflits de réservation, webhook de paiement

## Démarrage rapide

```bash
cp .env.example .env
docker compose up -d
docker compose exec app php artisan migrate --seed
```

## Limites connues et prochaines étapes

Choix assumés pour la V1 : TypeScript, files d'attente et emails, tests E2E, rôle gestionnaire, synchronisation de calendrier, monitoring et documentation OpenAPI.