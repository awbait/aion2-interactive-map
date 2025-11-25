FROM imbios/bun-node:1.2.19-20-slim AS base
WORKDIR /usr/src/app

FROM base AS deps
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun ci

FROM base AS builder
COPY --from=deps /temp/dev/node_modules node_modules
COPY . .

RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*
RUN bun run build

FROM docker.angie.software/angie:1.9.1-alpine AS runner
COPY --from=builder /usr/src/app/dist /usr/share/angie/html
COPY env.sh /env.sh

ENTRYPOINT [ "/bin/sh", "env.sh" ]

CMD ["angie", "-g", "daemon off;"]
