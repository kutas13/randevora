FROM node:20-alpine

WORKDIR /app

# Build context repo koku ise (Railway gibi) whatsapp-worker/ alt yolunu kullan;
# build context whatsapp-worker/ ise relative yol kullan.
COPY whatsapp-worker/package.json ./

RUN npm install --omit=dev --no-package-lock

COPY whatsapp-worker/server.js ./

# auth/ persistent olmali — Railway/Render: Volume mount -> /app/auth
VOLUME ["/app/auth"]

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]
