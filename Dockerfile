# Étape 1 : Construction de l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json yarn.lock ./

# Installer uniquement les dépendances de production pour builder
RUN yarn install --frozen-lockfile --production=false

# Copier le reste de l'application
COPY . .

# Générer le client Prisma
RUN yarn prisma generate

# Construire l'application
RUN yarn build

# Étape 2 : Lancement de l'application (image finale minimale)
FROM node:20-alpine

WORKDIR /app

# Définir la variable d'environnement pour la prod
ENV NODE_ENV=production

# Copier uniquement les fichiers nécessaires depuis le builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env

# Exposer le port sur lequel l'application tourne
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["yarn", "start"]