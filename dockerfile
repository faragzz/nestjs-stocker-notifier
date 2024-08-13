FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN pnpm install --production

COPY . .


RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
