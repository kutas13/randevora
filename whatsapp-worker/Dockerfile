FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./

# auth/ persistent olmali — docker run -v ile mount et
VOLUME ["/app/auth"]

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]
