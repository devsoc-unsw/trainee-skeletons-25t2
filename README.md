# NomNomVote

Description of project here

## Getting started
### Prerequisites

Before you begin, ensure you have met the following requirements:
- [PNPM](https://pnpm.io/installation) installed (if you are on Mac/Linux/WSL, follow the **On POSIX systems** section)
- [Docker](https://www.docker.com/) installed to run the database. If you are using WSL, make sure you follow [this](https://docs.docker.com/desktop/features/wsl/) to configure
Docker Desktop to use WSL2 as a backend.

### Installation
1. Clone the repo
```bash
git clone git@github.com:devsoc-unsw/trainee-skeletons-25t2.git

```
2. Navigate to the repo directory
```bash
cd trainee-skeletons-25t2

```
3. Install dependencies, this will install the dependencies for both the frontend and backend
```bash
pnpm install
```

4. Start the database via `docker compose` and run it in the background
```bash
docker compose up -d

```
5. Apply migration to load the correct schemas in Postgres.
```bash
pnpm drizzle-kit migrate
```
6. Start the frontend and backend (this will run both in parallel)
```bash
pnpm run dev

```

### Usage
Once both the frontend and backend are running, you can navigate to the frontend on `http://localhost:5173`
