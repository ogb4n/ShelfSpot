# Étape 1: Construction de l'application avec une image minimale
FROM node:20-alpine AS deps
WORKDIR /app

# Installer les dépendances avec des optimisations
COPY package.json yarn.lock ./
RUN apk add --no-cache libc6-compat && \
    yarn install --frozen-lockfile --production=false

# Étape 2: Génération du build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Génération du client Prisma et build
RUN yarn prisma generate && \
    yarn build

# Purger les dépendances de dev non nécessaires pour la production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Créer un utilisateur non-root pour plus de sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier uniquement les fichiers nécessaires
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/yarn.lock ./

# Optimiser la taille finale en supprimant les fichiers inutiles
RUN rm -rf /app/.next/cache && \
    yarn autoclean --force

# Changer l'utilisateur pour des raisons de sécurité
USER nextjs

# Exposer le port et démarrer l'application
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]