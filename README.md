<!-- TODO -->

# ADS Bridge

> _In short_: **ADS Bridge** is a Node.js service that receives events from ADS Publishers and instantly broadcasts them to subscribed AI agents. It supports scalable, real-time event delivery with Redis and is ready for containerized deployments.

Jump to [Quick Start](#quick-start) for setting up an ADS Publisher via your own ADS Bridge

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Locally](#running-locally)
  - [Docker Compose](#docker-compose)
- [Configuration](#configuration)
- [Endpoints](#endpoints)
- [Project Structure](#project-structure)
- [Development](#development)
- [Logging](#logging)
- [License](#license)
- [Contact](#contact)

---

## Overview

The ADS Bridge is intended to be run by ADS Publishers to send ADS events, which are then received by subscribed agents in real time. It is suitable for scalable deployments and supports sticky sessions via Traefik and Redis-backed Socket.io adapters.

---

## Quick Start

- TODO

---

## Architecture

- **Traefik**: Used as a reverse proxy for sticky sessions and load balancing multiple ADS Bridge instances to scale in production.

  > - **_Note_**: ADS Subscribers should only connect via the reverse proxy for effective load balancing

- **RabbitMQ**: Receives events from authenticated ADS Publishers.

- **Socket.io + Redis Adapter**: Broadcasts events to all connected agents (ADS Subscribers) and supports horizontal scaling.

- **Express**: Exposes health and stats endpoints for monitoring.

![Architecture Diagram](https://raw.githubusercontent.com/your-org/your-repo/main/docs/architecture.png) <!-- TODO: Replace with your actual diagram if available -->

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized setup)

### Running Locally

1. **Install dependencies:**

   ```sh
   yarn install
   # or
   npm install
   ```

2. **Build the project:**

   ```sh
   yarn build
   # or
   npm run build
   ```

3. **Start the service:**

   ```sh
   yarn start
   # or
   npm start
   ```

   The service will start on the port specified by `SERVER_PORT` (default: 8000).

### Docker Compose

A ready-to-use [docker-compose.dev.yaml](docker-compose.dev.yaml) is provided for local development, which brings up:

- ADS Bridge
- RabbitMQ
- Redis Stack
- Traefik (reverse proxy)

To start all services:

```sh
docker-compose -f docker-compose.dev.yaml up --build
```

---

## Configuration

All configuration is handled via environment variables. See [src/config/config.ts](src/config/config.ts) for details.

| Variable                        | Default               | Description                           |
| ------------------------------- | --------------------- | ------------------------------------- |
| `SERVER_PORT`                   | `8000`                | Port for the Express server           |
| `REDIS_HOST`                    | `localhost`           | Redis host for Socket.io adapter      |
| `REDIS_PORT`                    | `6379`                | Redis port                            |
| `RABBITMQ_HOST`                 | `localhost`           | RabbitMQ host                         |
| `RABBITMQ_PORT`                 | `5672`                | RabbitMQ port                         |
| `RABBITMQ_USERNAME`             | `guest`               | RabbitMQ username                     |
| `RABBITMQ_PASSWORD`             | `guest`               | RabbitMQ password                     |
| `ADS_PUBLISH_SOCKET_EVENT_NAME` | `ads_event_published` | Socket.io event name for broadcasting |
| `LOG_LEVEL`                     | `info`                | Logging level (`debug`, `info`, etc.) |

You can override these in your environment or in the `docker-compose.yaml`.

---

## Endpoints

### Express Endpoints

- **GET `/health`**  
  Returns service health and hostname.

  ```json
  { "status": "healthy", "hostname": "your-hostname" }
  ```

- **GET `/stats`**  
  Returns Socket.io connection stats and hostname.
  ```json
  {
    "totalSocketioConnections": 5,
    "currentInstanceSocketioConnections": 2,
    "hostname": "your-hostname"
  }
  ```

### Socket.io

- **Event:**  
  The event name is configurable via `ADS_PUBLISH_SOCKET_EVENT_NAME` environment variable (default: `ads_event_published`).
- **Payload:**  
  The payload is a JSON object as defined in [`ADSDataPayload`](src/types/types.ts).

---

## Project Structure

```
src/
  index.ts                # Entry point
  config/                 # Configuration loader
  core/                   # Core bridge and RabbitMQ client
  services/
    express/              # Express handlers
    rabbitmq/             # RabbitMQ event callback
    socketio/             # Socket.io handlers
  types/                  # TypeScript types
  utils/                  # Logger and quit utilities
```

- Main entry: [`src/index.ts`](src/index.ts)
- Bridge logic: [`src/core/bridge.ts`](src/core/bridge.ts)
- RabbitMQ client: [`src/core/client.ts`](src/core/client.ts)
- Logger: [`src/utils/logger.ts`](src/utils/logger.ts)
- Express handlers: [`src/services/express/setupHandlers.ts`](src/services/express/setupHandlers.ts)
- Socket.io handlers: [`src/services/socketio/setupHandlers.ts`](src/services/socketio/setupHandlers.ts)

---

## Development

- **Watch mode:**

  ```sh
  yarn dev
  # or
  npm run dev
  ```

  Uses `nodemon` for hot-reloading.

- **TypeScript:**  
  All source code is in TypeScript. Build output is in `build/`.

---

## Logging

Logging level can be configured via the `LOG_LEVEL` environment variable with the following values

| Level | Description                                     |
| ----- | ----------------------------------------------- |
| error | Critical errors that may cause the app to crash |
| warn  | Warnings about potentially harmful situations   |
| info  | General operational information                 |
| debug | Debug-level logs for development                |
| silly | Extremely verbose logs, lowest priority         |

---

## Contributing

Contributions are welcome!

If you have ideas for improvements, bug fixes, or new features, please open a [GitHub Issue](https://github.com/agentdatashuttle/ads-bridge/issues) to discuss or submit a Pull Request (PR).

**How to contribute:**

1. Fork this repository and create your branch from `main`.
2. Make your changes with clear commit messages.
3. Ensure your code passes tests.
4. Open a Pull Request describing your changes.

If you encounter any bugs or have feature requests, please [raise an issue](https://github.com/agentdatashuttle/ads-bridge/issues) on GitHub.

Thank you for helping improve the Agent Data Shuttle initiative!

---

## License

This project is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

---

## Contact

For questions or support, please contact
<br>[agentdatashuttle@knowyours.co](mailto:agentdatashuttle@knowyours.co) or [sudhay2001@gmail.com](mailto:sudhay2001@gmail.com)
