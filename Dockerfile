FROM ubuntu:latest

RUN apt-get update && apt-get install -y --no-install-recommends nodejs npm

RUN npm install -g bun

COPY . .

RUN bun i

RUN bun run build

EXPOSE 3000

ENV PORT 3000

CMD ["bun", "run", "start"]
