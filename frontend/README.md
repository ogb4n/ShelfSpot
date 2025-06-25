## ShelfSpot

ShelfSpot is a self-hosted application built with Next.js, designed to help you track and manage the inventory of all items in your home. Inspired by Grocy, this application offers a comprehensive solution for organizing and monitoring your household goods.

## Features

- Inventory Management: Add, edit, and delete items with details such as category, quantity, purchase date, expiration date, etc.
- Location Tracking: Assign specific locations to each item for optimal organization.
- Stock Alerts: Receive notifications when stock levels are low or items are approaching their expiration date. _( not yet implemented )_
- Transaction History: View the complete history of additions, removals, and modifications of items. _( not yet implemented )_
- User Management: Create user accounts with customized roles and permissions.
- User-friendly Interface: Enjoy an intuitive and responsive user interface, accessible from any device connected to your home network.

## Prerequisites

- Docker: Make sure Docker is installed on your machine. You can download Docker Desktop from the [official website](https://docs.docker.com/get-started/).

## Installation and Setup

- Clone the repository:

```bash
git clone https://github.com/ogb4n/shelfspot.git
cd shelfspot
```

- Configure the application:

in config > default.json

```json
{
  "app": {
    "port": 3000
  }
}
```

- Copy the .env.example file to .env:

```bash
cp .env.example .env
```

Modify the .env file to include the necessary information, such as environment variables for the database, API keys, etc.

Build the Docker image:

```bash
docker build -t gestionnaire-stock-domestique .
```

Run the Docker container:

> Note: Port 3000 is used by default. If you wish to use another port, modify the Dockerfile accordingly and adjust the docker-compose file used below.

#### Docker Compose

The recommended method for running the ShelfSpot application is to use Docker Compose. Once you have built the docker image locally or retrieved the image from Docker Hub, go inside the folder and run the following command:

```bash
docker-compose up -d
```

Access the application:

Open your browser and go to http://localhost:3000 (or the port you specified) to access the application.

Create the first account which will automatically be set as administrator.

You're all set to inventory your home!

### Contribution

Contributions are welcome! If you want to report a bug, suggest a new feature, or submit a pull request, please refer to the CONTRIBUTING.md file for more details.
