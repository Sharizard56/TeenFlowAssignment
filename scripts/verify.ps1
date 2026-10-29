$ErrorActionPreference = "Stop"
kubectl get nodes
kubectl get pods -n teenflow
kubectl get deployments -n teenflow
kubectl get services -n teenflow
kubectl get pvc -n teenflow
kubectl get ingress -n teenflow
kubectl get hpa -n teenflow
kubectl rollout status deployment/task-service -n teenflow --timeout=180s
kubectl rollout status deployment/planner-service -n teenflow --timeout=180s
kubectl rollout status deployment/frontend -n teenflow --timeout=180s
kubectl rollout status statefulset/postgres -n teenflow --timeout=180s
