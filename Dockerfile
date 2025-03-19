# Étape 1: Construction de l'image
FROM node:alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et yarn.lock
COPY package.json yarn.lock ./

# Installer les dépendances
RUN yarn install

# Copier le reste de l'application
COPY . .

# Construire l'application
RUN yarn build

# Étape 2: Lancement de l'application
FROM node:alpine

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