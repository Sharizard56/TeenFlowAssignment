# Eight-minute demonstration script

0:00-0:45: Introduce TeenFlow: task organizer with rule-based daily plan.
0:45-1:45: Explain React, Spring Boot, FastAPI, PostgreSQL, Ingress, PVC and HPA.
1:45-3:00: Open http://teenflow.local, create and complete tasks, generate a plan.
3:00-4:00: Show GET /api/tasks and GET /api/planner/today, and the inter-service HTTP call in Planner code.
4:00-5:00: Run kubectl get pods,svc,ingress,pvc,hpa -n teenflow and kubectl logs deployment/planner-service -n teenflow.
5:00-6:00: Temporarily remove HPA: kubectl delete hpa task-service -n teenflow. Scale task-service to 3; verify planner remains at 2. Re-apply kubectl apply -k kubernetes afterwards.
6:00-7:00: Create task; kubectl delete pod postgres-0 -n teenflow; wait for Ready; refresh task list and confirm data persists.
7:00-8:00: Walk through YAML, explain security (demo only), limitations, and trade-offs.

Record actual running commands and results; do not claim to have performed experiments that did not succeed. Show Docker Hub repositories and Git repository URL.
