FROM node:22-slim AS builder

RUN apt update -qq && apt install -y python-is-python3 pkg-config build-essential

RUN apt update -qq && apt install -y bash curl unzip

RUN curl -fsSl -o install https://bun.sh/install && chmod +x ./install && BUN_INSTALL="/usr/local" ./install

WORKDIR /app
COPY package.json bun.lock ./
RUN bun ci

# Install Playwright with Chromium
RUN npx playwright install --with-deps chromium

# Copy source and build
COPY . .
RUN bun run build

FROM node:22-slim AS runner

COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app


WORKDIR /app
ENV NODE_ENV=production
CMD [ "bun", "./build/index.js"]