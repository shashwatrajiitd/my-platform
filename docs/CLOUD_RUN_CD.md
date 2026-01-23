# Continuous Deployment to Google Cloud Run (from `main`)

This repo deploys **two Cloud Run services**:

- `apps/web` (Next.js)
- `apps/api` (FastAPI)

On every push to `main`, GitHub Actions builds + pushes Docker images to **Artifact Registry** and deploys new Cloud Run **revisions**.

## 1) One-time setup in GCP

### Create an Artifact Registry repo

Create a **Docker** repository (example name: `portfolio`):

- Region: pick one (example: `us-central1`)
- Repository format: Docker

### Create a deployer service account

Grant these roles (minimum typical set):

- `roles/run.admin`
- `roles/iam.serviceAccountUser`
- `roles/artifactregistry.writer`

### Setup Workload Identity Federation (recommended)

Create a Workload Identity Pool + Provider for GitHub OIDC and allow it to impersonate the deployer service account.

You will need:

- Workload identity provider resource name (saved as GitHub secret `GCP_WORKLOAD_IDENTITY_PROVIDER`)
- Deployer service account email (saved as GitHub secret `GCP_DEPLOYER_SERVICE_ACCOUNT`)

## 2) GitHub repo secrets to add

Add these GitHub Actions secrets:

- `GCP_PROJECT_ID` — your GCP project id
- `GCP_REGION` — Cloud Run region (example: `us-central1`)
- `ARTIFACT_REGISTRY_REPO` — Artifact Registry repo name (example: `portfolio`)
- `CLOUD_RUN_WEB_SERVICE` — Cloud Run service name for web (example: `portfolio-web`)
- `CLOUD_RUN_API_SERVICE` — Cloud Run service name for api (example: `portfolio-api`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER` — Workload identity provider resource name
- `GCP_DEPLOYER_SERVICE_ACCOUNT` — deployer service account email
- `NEXT_PUBLIC_API_URL` — public base URL used by the frontend to call the API
- `GOOGLE_API_KEY` — Gemini API key (used by the backend)

## 3) How deployments work

- Pushing to `main` triggers `.github/workflows/cloudrun-deploy.yml`
- It builds/pushes two images:
  - `.../portfolio-web:${GITHUB_SHA}`
  - `.../portfolio-api:${GITHUB_SHA}`
- Then it deploys both services (new Cloud Run revisions)

## Notes / gotchas

- `NEXT_PUBLIC_API_URL` is **inlined at build-time** into the frontend bundle, so changes to it require a rebuild (the workflow already rebuilds on every `main` push).
- The API service is deployed with `--port 8000` to match `apps/api/Dockerfile`.
- Chroma persistence: the workflow sets `CHROMA_PERSIST_DIR=/app/chroma`. On Cloud Run, the filesystem is **ephemeral** by default; if you need persistence across revisions, we can move Chroma to a managed store (Cloud Storage / Cloud SQL / AlloyDB / etc.).

