FROM oven/bun:latest AS builder

RUN mkdir /app
# NodeJS app lives here
WORKDIR /app

# Install packages needed to build node modules
RUN apt update -qq && \
    apt install -y python-is-python3 pkg-config build-essential

# Install node modules
COPY package.json bun.lock ./
RUN bun ci 

# copy source across (excludes items filtered by .dockerignore)
COPY . .

RUN --mount=type=secret,id=ADMIN_PASSWORD \
    --mount=type=secret,id=ORIGIN \
    ADMIN_PASSWORD="$(cat /run/secrets/ADMIN_PASSWORD)" \
    ORIGIN="$(cat /run/secrets/ORIGIN)" \
    bun run build

FROM oven/bun:latest AS runner

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app
WORKDIR /app

ENV NODE_ENV=production

# Start the server by default, this can be overwritten at runtime
CMD [ "bun", "run", "build"]
