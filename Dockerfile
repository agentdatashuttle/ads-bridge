# docker buildx build --platform linux/amd64,linux/arm64 -t agentdatashuttle/ads-bridge:25.6.1 -t agentdatashuttle/ads-bridge:latest . --push

# Build stage
FROM node:21.6-slim AS build
WORKDIR /home/ads_bridge
COPY package*.json .
COPY yarn* .
RUN yarn
COPY . .
RUN yarn build

# Production stage
FROM node:21.6-slim AS prod
WORKDIR /home/ads_bridge
COPY --from=build /home/ads_bridge/package*.json .
COPY --from=build /home/ads_bridge/node_modules ./node_modules
COPY --from=build /home/ads_bridge/build ./build
CMD [ "npm","start" ]