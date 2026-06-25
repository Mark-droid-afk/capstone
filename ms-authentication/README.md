# API Auth

Small .NET authentication API with PostgreSQL, pgAdmin, and EF Core migrations.

## Requirements

- Docker and Docker Compose
- .NET 10 SDK, only needed when running outside Docker

## Setup

Create your local environment file:

```bash
cp .env.example .env
```

Default local ports:

| Service | URL / Port |
| --- | --- |
| API | `http://localhost:5007` |
| pgAdmin | `http://localhost:5750` |
| PostgreSQL | `localhost:5437` |

Inside Docker, services connect to PostgreSQL using:

```text
Host: db
Port: 5432
Database: auth_db
```

## Run With Docker

```bash
docker compose up -d --build
```

This starts PostgreSQL, runs EF Core migrations, starts the API, and starts pgAdmin.

To stop services:

```bash
docker compose down
```

To reset local database volumes:

```bash
docker compose down -v
docker compose up -d --build
```

## pgAdmin Login

Use the credentials from `.env`:

```text
Email: admin@pgadmin.org
Password: admin
```

The server is preconfigured in `.docker/config/postgres/pgadmin-servers.json`.

## Local Development

Run the API locally:

```bash
dotnet restore
dotnet run
```

Build:

```bash
dotnet build
```

PS: Don’t worry about the `JwtSecretKey` inside `appsettings.json` for now — it is not final and is only being used for development purposes. It will be replaced later with a more secure configuration approach (such as environment variables or a secret manager) before deployment.
