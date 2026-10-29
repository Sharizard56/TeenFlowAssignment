# TeenFlow: Kubernetes Microservices Learning Project

A simple browser-based teen task organizer with a daily planning companion. Built for a Kubernetes assignment.

## Components

- React/TypeScript frontend served by Nginx
- Spring Boot 3 / Java 25 Task Service with CRUD REST API
- Python FastAPI Planner Service that **calls Task Service via REST**
- PostgreSQL 17 database, accessed only by Task Service
- Kubernetes Deployments, Services, Ingress, StatefulSet, PVC, and independent HPAs

See [architecture and security](docs/ARCHITECTURE.md) and [video demo script](docs/DEMO.md).

## Prerequisites (Windows PowerShell)

- Docker Desktop with Linux containers and WSL2 integration
- Docker Desktop Kubernetes enabled under Settings > Kubernetes (wait for Running)
- kubectl (bundled with Docker Desktop or installed separately)
- Docker Hub account; Docker Desktop logged in using `docker login`
- Git (to publish the repository)
- A Kubernetes ingress controller installed (Ingress resources alone do not route traffic)
- Metrics Server installed if you want HPA CPU metrics

## Step 1: Test locally with Docker Compose

From the repository root in PowerShell:

```powershell
docker compose up --build -d
docker compose ps
```

Open http://localhost:3000 and create tasks. The task API is http://localhost:8080/api/tasks and the planner API is http://localhost:8000/docs (interactive FastAPI documentation). The Postgres database is persisted in the `postgres-data` Docker volume. `docker compose down` preserves the volume; **do not use `down -v`** when testing persistence.

```powershell
docker compose logs -f planner-service
docker compose down
```

## Step 2: Run automated tests

Use a local Python virtual environment for the included Planner tests:

```powershell
cd planner-service
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
pytest -q
cd ..
```

Java tests (requires Maven + Java 25 installed locally):

```powershell
cd task-service
mvn test
cd ..
```

Frontend build (requires Node 22+):

```powershell
cd frontend
npm install
npm run build
cd ..
```

## Step 3: Publish images to Docker Hub (required)

```powershell
docker login
.\scripts\push-images.ps1 -DockerHubUser YOUR_DOCKERHUB_USERNAME
.\scripts\set-images.ps1 -DockerHubUser YOUR_DOCKERHUB_USERNAME
```

Check the three repositories in Docker Hub and make them public (or configure Kubernetes imagePullSecrets for private repositories). **Do not submit without verifying that images exist on Docker Hub.** Commit the updated image references to Git.

## Step 4: Deploy on Docker Desktop Kubernetes

Check Docker Desktop's selected context:

```powershell
kubectl config current-context
kubectl get nodes
```

Expected context is usually `docker-desktop`. Install an Ingress controller compatible with your cluster. For example, use the upstream ingress-nginx installation instructions for your Kubernetes version. The `kubernetes/ingress.yaml` assumes `ingressClassName: nginx`; if you install another controller, adjust this field. Confirm its pods are Ready before proceeding.

**Create the namespace and credentials:**

```powershell
kubectl apply -f kubernetes/namespace.yaml
kubectl -n teenflow create secret generic postgres-credentials --from-literal=password='CHANGE_TO_A_LOCAL_DEMO_PASSWORD'
```

For Kubernetes, the database password must match the Secret for both PostgreSQL and Task Service. The sample Docker Compose password is intentionally separate. Do not commit real passwords.

```powershell
kubectl apply -k kubernetes/
.\scriptserify.ps1
```

If images are stuck in ImagePullBackOff, inspect `kubectl describe pod -n teenflow POD_NAME` and check the Docker Hub names. If Postgres is Pending, check `kubectl get storageclass` and `kubectl get pvc -n teenflow`; Docker Desktop normally supplies a default StorageClass.

**Browser access:** The Ingress is configured for `teenflow.local`. Find the reachable address of your ingress controller. If it is bound to localhost on Windows, add `127.0.0.1 teenflow.local` to the Windows hosts file (run Notepad as Administrator to edit `C:\Windows\System32\drivers\etc\hosts`) and open http://teenflow.local. Some Docker Desktop/Kubernetes versions require a different ingress IP or port. Test routing with `curl.exe -H "Host: teenflow.local" http://127.0.0.1/` if port 80 is bound locally. **Fallback:** `kubectl -n teenflow port-forward service/frontend 3000:80` then browse http://localhost:3000; this validates external browser access via port-forward but does not replace an Ingress demonstration if one is required.

## Step 5: Show horizontal scaling

```powershell
kubectl get hpa -n teenflow
# HPA will reconcile manual replica changes, so temporarily remove the Task HPA:
kubectl delete hpa task-service -n teenflow
kubectl scale deployment/task-service --replicas=3 -n teenflow
kubectl get deployments -n teenflow
kubectl get pods -n teenflow
# Restore HPA:
kubectl apply -k kubernetes/
```

The Planner Deployment stays at its own replica count. For automatic HPA demonstration, install Metrics Server, then generate sustained CPU load. Note: normal TeenFlow traffic is too light to trigger CPU scaling; simulate heavier use or use a dedicated CPU-load experiment.

## Step 6: Show database persistence

1. Create a task in the UI.
2. `kubectl delete pod postgres-0 -n teenflow`
3. `kubectl rollout status statefulset/postgres -n teenflow --timeout=180s`
4. Refresh the browser and confirm the task still exists.
5. Optionally restart Docker Desktop Kubernetes **without resetting or deleting the cluster**, and check again.

The PVC survives pod restarts. Full cluster deletion, disk failure, or Docker Desktop factory reset may destroy local storage; durable off-cluster backups are needed for those scenarios.

## Logs and troubleshooting

```powershell
kubectl get all -n teenflow
kubectl get pvc -n teenflow
kubectl logs deployment/task-service -n teenflow --tail=100
kubectl logs deployment/planner-service -n teenflow --tail=100
kubectl describe pod postgres-0 -n teenflow
```

## Assignment limitations

- No authentication: **local fictional demo data only**. APIs are not safe to publish publicly.
- Database is a single replica, so there is no high availability.
- Microservices are intentionally overkill for this small product; imagine many schools and many more planning requests to justify scaling.
- Public Docker Hub image publication, Git remote creation, video recording, and real cluster verification must be performed by the student.
