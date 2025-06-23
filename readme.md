# Social Media Microservice

A suite of microservices powering a scalable social media platform, built with TypeScript and Docker. This project follows best practices in microservice architecture, API gateway routing, and container orchestration.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Services](#services)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running the Application](#running-the-application)
   - [Docker Compose](#docker-compose)
   - [Kubernetes](#kubernetes)
6. [API Gateway](#api-gateway)
7. [Authentication & Authorization](#authentication--authorization)
8. [Service Endpoints](#service-endpoints)
9. [Logging & Monitoring](#logging--monitoring)
10. [Environment Variables](#environment-variables)
11. [Development & Testing](#development--testing)
12. [Contributing](#contributing)
13. [License](#license)
14. [Contact](#contact)

---

## Architecture Overview

```plaintext
┌─────────────────┐        ┌──────────────────┐
│  API Gateway    │ ◀────▶ │ Identity Service │
│ (Express/Nest)  │        └──────────────────┘
└────────┬────────┘                ▲
         │                         │
         ▼                         │
┌──────────────────┐       ┌──────────────────┐
│ Post Service     │       │ Media Service    │
└──────────────────┘       └──────────────────┘
         │                         │
         ▼                         │
┌──────────────────┐       ┌──────────────────┐
│ Search Service   │       │ Chat Service     │
└──────────────────┘       └──────────────────┘
```

- **API Gateway**: Central entry point for routing, authentication, and rate limiting.
- **Identity Service**: Manages user signup, login, JWT issuance.
- **Post Service**: CRUD operations for posts, comments, likes.
- **Media Service**: Handles file uploads (images, videos) and CDN integration.
- **Search Service**: Indexing and search across posts and users.
- **Chat Service**: Real-time messaging between users.

---

## Services

| Service Name       | Description                             | Port |
| ------------------ | --------------------------------------- | ---- |
| `api-gateway`      | Routes and aggregates requests          | 4000 |
| `identity-service` | Authentication, user management         | 4001 |
| `post-service`     | Posts, comments, reactions              | 4002 |
| `media-service`    | Uploads, storage management             | 4003 |
| `search-service`   | Full-text search via Elasticsearch/NATS | 4004 |
| `chat-service`     | WebSocket-based chat microservice       | 4005 |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Docker & Docker Compose](https://docs.docker.com/)
- [kubectl](https://kubernetes.io/) (for K8s deployment)
- [Helm](https://helm.sh/) (optional)

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MorsiYoucef/social_media_microservice.git
   cd social_media_microservice
   ```

2. Install dependencies in each service directory:

   ```bash
   cd api-gateway && npm install && cd ../identity-service && npm install ...
   ```

---

## Running the Application

### Docker Compose

1. Build and start all services:

   ```bash
   docker-compose up --build
   ```

2. Access the API gateway at `http://localhost:4000`.

### Kubernetes

1. Apply deployments and services:

   ```bash
   kubectl apply -f k8s-deployment.yaml
   ```

2. Verify pods are running:

   ```bash
   kubectl get pods
   ```

---

## API Gateway

All external traffic goes through the API Gateway which handles:

- Request routing to internal services
- JWT validation and user extraction
- Rate limiting and CORS policies

---

## Authentication & Authorization

- **Signup**: `POST /auth/signup`
- **Login**: `POST /auth/login` (`email`, `password`)
- Returns a JWT token used in `Authorization: Bearer <token>` header.

---

## Service Endpoints

### Post Service (`/posts`)

- `GET /posts` - List posts
- `GET /posts/:id` - Retrieve a specific post
- `POST /posts` - Create a new post
- `PUT /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

### Media Service (`/media`)

- `POST /media/upload` - Upload an image or video
- `DELETE /media/:filename` - Remove a media file

### Search Service (`/search`)

- `GET /search?q=keyword` - Full-text search across posts and users

### Chat Service (`/chat`)

- WebSocket connection at `ws://localhost:4005`
- Events: `message:send`, `message:receive`

---

## Logging & Monitoring

- All services use [Winston](https://github.com/winstonjs/winston) for structured logs.
- Logs are output to console and can be aggregated via Elasticsearch/Kibana.

---

## Environment Variables

Create a `.env` file in each service directory with required variables:

```dotenv
# Example for identity-service
PORT=4001
JWT_SECRET=your_secret_key
DATABASE_URL=mongodb://mongo:27017/identity
```

---

## Development & Testing

- Run unit tests:

  ```bash
  cd post-service && npm test
  ```

- Linting and formatting:

  ```bash
  npm run lint
  npm run format
  ```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/XYZ`)
3. Commit your changes (`git commit -m "Add XYZ feature"`)
4. Push to branch (`git push origin feature/XYZ`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or feedback, reach out to [[youcef@example.com](mailto\:youcef@example.com)].

