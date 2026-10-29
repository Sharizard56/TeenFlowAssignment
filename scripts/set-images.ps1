param([Parameter(Mandatory=$true)][string]$DockerHubUser)
$ErrorActionPreference = "Stop"
foreach ($service in @("task-service", "planner-service", "frontend")) {
  $file = "kubernetes/$service.yaml"
  (Get-Content $file -Raw).Replace('YOUR_DOCKERHUB_USERNAME', $DockerHubUser) | Set-Content $file
}
Write-Host "Updated image references."
