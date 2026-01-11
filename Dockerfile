FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY scripts ./scripts
COPY data ./data

CMD ["node", "scripts/fetch-wakatime.js"]
