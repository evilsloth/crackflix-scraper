FROM node:17-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
RUN npm ci

COPY . .
RUN npm run build && npm prune --production

ENV NODE_ENV production
EXPOSE 3000
CMD ["node", "dist/main.js"]