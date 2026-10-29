param([Parameter(Mandatory=$true)][string]$DockerHubUser)
$ErrorActionPreference = "Stop"
foreach ($service in @("task-service", "planner-service", "frontend")) {
  $image = "${DockerHubUser}/teenflow-${service}:1.0.0"
  docker build -t $image "./$service"
  if ($LASTEXITCODE -ne 0) { throw "Build failed: $service" }
  docker push $image
  if ($LASTEXITCODE -ne 0) { throw "Push failed: $service" }
}
Write-Host "Images pushed. Update Kubernetes image names next."
