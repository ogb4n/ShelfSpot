## ShelfSpot

ShelfSpot est une application auto-hébergée conçue avec Next.js, imaginée pour vous aider à suivre et gérer l'inventaire de tous les articles de votre maison. Inspirée par Grocy, cette application offre une solution complète pour organiser et surveiller vos biens domestiques.

## Fonctionnalités

- Gestion de l'inventaire : Ajoutez, modifiez et supprimez des articles avec des détails tels que la catégorie, la quantité, la date d'achat, la date d'expiration, etc.
- Suivi des emplacements : Attribuez des emplacements spécifiques à chaque article pour une organisation optimale.
- Alertes de stock : Recevez des notifications lorsque les niveaux de stock sont bas ou que des articles approchent de leur date d'expiration. _( pas encore implémenté )_
- Historique des transactions : Consultez l'historique complet des ajouts, retraits et modifications d'articles. _( pas encore implémenté )_
- Gestion des utilisateurs : Créez des comptes utilisateurs avec des rôles et des permissions personnalisés.
- Interface conviviale : Profitez d'une interface utilisateur intuitive et responsive, accessible depuis n'importe quel appareil connecté à votre réseau domestique.

## Prérequis

- Docker : Assurez-vous que Docker est installé sur votre machine. Vous pouvez télécharger Docker Desktop depuis le [site officiel](https://docs.docker.com/get-started/).

## Installation et Exécution

- Cloner le dépôt :

```bash
git clone https://github.com/ogb4n/shelfspot.git
cd shelfspot
```

- Configurer l'application :

dans config > default.json

```json
{
  "app": {
    "port": 3000
  }
}
```

- Copiez le fichier .env.example en .env :

```bash
cp .env.example .env
```

Modifiez le fichier .env pour y renseigner les informations nécessaires, telles que les variables d'environnement pour la base de données, les clés API, etc.

Construire l'image Docker :

```bash
docker build -t gestionnaire-stock-domestique .
```

Exécuter le conteneur Docker :

> Remarque : Le port 3000 est utilisé par défaut. Si vous souhaitez utiliser un autre port, modifiez le fichier Dockerfile en conséquence et ajustez le fichier docker-compose ci-dessous.

#### Docker Compose

La méthode recommandée pour exécuter l'application ShelfSpot est d'utiliser Docker Compose. Une fois que vous avez construit l'image docker localement ou que vous avez récupéré l'image à partir de Docker Hub rendez-vous à l'interieur du dossier et effectuez la commande suivante :

```bash
docker-compose up -d
```

Accéder à l'application :

Ouvrez votre navigateur et rendez-vous sur http://localhost:3000 (ou le port que vous avez spécifié) pour accéder à l'application.

Créez le premier compte qui sera automatiquement défini comme administrateur.

Vous êtes partis pour faire l'inventaire de votre maison !

### Contribution

Les contributions sont les bienvenues ! Si vous souhaitez signaler un bug, proposer une nouvelle fonctionnalité ou soumettre une pull request, veuillez consulter le fichier CONTRIBUTING.md pour plus de détails.
