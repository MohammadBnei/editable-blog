# Bun base image, pinned by tag AND multi-arch index digest. The tag must match
# package.json's packageManager (pins.test.js checks both). Fully qualified because the
# build box's buildah does not resolve every short name.
ARG BUN_IMAGE=docker.io/oven/bun:1.4.2-alpine@sha256:d888c0ae6c86d7866ff10c5aafdd9077b36aee6455b33dd270fb93c0dd5cef6f

FROM ${BUN_IMAGE} AS builder

WORKDIR /app
COPY package.json bun.lock ./
RUN bun ci

# Copy source and build
COPY . .
RUN bun run build
# The build-gated CSP test only runs where build/ exists: here, on every PR's image check.
RUN bun test server.test.js

FROM ${BUN_IMAGE} AS runner

COPY --from=builder /app/build /app/build
COPY --from=builder /app/server.js /app

WORKDIR /app
ENV NODE_ENV=production
# The release version, passed by release.yml's build (X.Y.Z, or X.Y.Z+<sha> untagged);
# dev when built without it. Last, so with a layer cache only this tail varies by version.
ARG VERSION
LABEL org.opencontainers.image.version=${VERSION:-dev}
ENV VERSION=${VERSION:-dev}
CMD ["bun", "server.js"]
