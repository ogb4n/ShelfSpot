# Étape 1 : Construire l'application Next.js
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package.json package-lock.json ./

# Installer les dépendances en mode production
RUN npm ci --omit=dev

# Copier le code source
COPY . .

# Construire l'application Next.js
RUN npm run build

# Étape 2 : Exécuter l'application avec un serveur léger
FROM node:18-alpine AS runner

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement le build et les dépendances
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Définir la variable d'environnement pour la production
ENV NODE_ENV=production

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run", "start"]
