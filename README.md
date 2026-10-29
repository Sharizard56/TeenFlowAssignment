# TeenFlow: Kubernetes Microservices Learning Project

A simple browser-based teen task organizer with a daily planning companion. Built for a Kubernetes assignment.

## Components

- React/TypeScript frontend served by Nginx
- Spring Boot 3 / Java 25 Task Service with CRUD REST API
- Python FastAPI Planner Service that **calls Task Service via REST**
- PostgreSQL 17 database, accessed only by Task Service
- Kubernetes Deployments, Services, Ingress, StatefulSet, PVC, and independent HPAs

