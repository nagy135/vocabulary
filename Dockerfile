FROM ubuntu:latest

RUN apt install npm

RUN npm install -g bun

COPY . .

RUN bun i

RUN bun run build

EXPOSE 3000

ENV PORT 3000

CMD ["bun", "run", "start"]
