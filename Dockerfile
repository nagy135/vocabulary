FROM oven/bun:1

COPY . .

RUN bun i

RUN bun run build

EXPOSE 3000

ENV PORT 3000

CMD ["bun", "run", "start"]
