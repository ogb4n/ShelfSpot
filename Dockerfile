# Étape 1 : Construction de l'application
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et yarn.lock
COPY package.json yarn.lock ./

# Copier le reste de l'application ( SI CA MARCHE PAS INVERSER AVEC PRISMA INSTALL)
COPY . .

# Installer les dépendances
RUN yarn install

# Générer le client Prisma
RUN yarn prisma generate

# Construire l'application
RUN yarn build

# Étape 2 : Lancement de l'application
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires depuis l'étape de construction
COPY --from=builder /app ./

# Installer les dépendances de production
RUN yarn install --production

# Exposer le port sur lequel l'application tourne
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["yarn", "start"]