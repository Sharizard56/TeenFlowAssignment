# Architecture and assignment mapping

## Components

| Component | Deployment type | Responsibility | Data ownership |
|---|---|---|---|
| React UI | Deployment + ClusterIP Service | Browser-based interface | None |
| Task Service (Java) | Deployment + ClusterIP Service | Task REST CRUD | Exclusive access to PostgreSQL |
| Planner Service (Python) | Deployment + ClusterIP Service | Calls Task API; scores and schedules tasks | Stateless |
| PostgreSQL | StatefulSet + ClusterIP Service + PVC | Durable task records | Database storage |
| Ingress | Ingress resource + separately installed controller | HTTP access from outside Kubernetes | None |

## Request flow

1. Browser sends GET /api/planner/today to the Ingress.
2. Ingress routes request to a Planner Service replica.
3. Planner uses HTTPX to GET http://task-service:8080/api/tasks via Kubernetes DNS.
4. Task Service queries PostgreSQL through JDBC/JPA.
5. Planner ranks pending tasks and returns JSON to the browser.

## Architecture patterns

- Stateless and independently scalable backend Deployments.
- REST-based synchronous service communication.
- Service discovery and stable virtual IPs using Kubernetes Services.
- Data ownership: only Task Service connects to PostgreSQL.
- StatefulSet + PVC for database persistence.
- Ingress for edge routing; health probes for self-healing.
- Separate HPAs allow independent scaling.

## Trade-offs and business implications

A monolith would be simpler for a small student task organizer. Microservices add networking failure modes, deployment complexity, operational cost, and distributed debugging. The split is intentional for a Kubernetes learning exercise. Independent scaling becomes useful in a hypothetical high-traffic school deployment where planning requests are much more CPU-intensive than task CRUD. With a single PostgreSQL instance, database throughput and availability remain shared bottlenecks. A real service would need backups, restore drills, and possibly managed database infrastructure.

## Security

**This is a local, single-user demo. Do not expose it publicly or use real minors' data.**

- No authentication or authorization: any network client reaching the APIs can read or change demo tasks. Add OIDC login and ownership enforcement before multi-user/public use.
- HTTP only: local Ingress is unencrypted. Add TLS and a trusted certificate for production.
- Kubernetes Secret protects credentials from accidental Git commits, but is not encryption by itself. Configure RBAC, etcd encryption, and an external secret manager for stronger protection.
- PostgreSQL is reachable only via ClusterIP, not public Ingress.
- Non-root API containers; pin image digests, scan images, and update dependencies for production.
- Add restrictive NetworkPolicies (requires a compatible CNI), rate limiting, audit logs, and least-privilege service accounts.
- Store only necessary student data; define retention/deletion rules and privacy safeguards.
- Readiness/liveness checks, bounded Planner HTTP timeouts, and clear 503 errors mitigate some service failures.
- PVC durability depends on the storage backend. For cluster deletion or disk failure, use backups and externally durable storage.

## REST contract

Task Service:
- GET /api/tasks -> 200 list
- GET /api/tasks/{uuid} -> 200 or 404
- POST /api/tasks -> 201, accepts title, description, subject, priority, dueAt, estimatedMinutes
- PUT /api/tasks/{uuid} -> 200 or 404, full editable field replacement
- PATCH /api/tasks/{uuid}/complete -> 200 or 404
- DELETE /api/tasks/{uuid} -> 204 or 404

Planner Service:
- GET /api/planner/today?availableMinutes=90 -> 200 with recommendations or 503 if Task Service unavailable
- GET /api/planner/progress -> 200 with total, completed, pending or 503
- GET /health/live and /health/ready -> 200

All payloads are JSON. IDs are UUIDs. dueAt uses ISO-8601 UTC timestamps. This demo intentionally has no student identity endpoint.
