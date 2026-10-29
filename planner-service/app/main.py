import os
from datetime import datetime, timezone
from typing import Any
import httpx
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

app = FastAPI(title="TeenFlow Planner Service", version="1.0.0")
# Environment variable for the task service URL, defaulting to localhost if not set
TASK_SERVICE_URL = os.getenv("TASK_SERVICE_URL", "http://localhost:8080").rstrip("/")

class Recommendation(BaseModel):
    taskId: str
    title: str
    score: int
    suggestedMinutes: int
    reason: str

# Rank tasks based on priority, due date, and available time
def rank(tasks: list[dict[str, Any]], available_minutes: int, now: datetime | None = None) -> list[Recommendation]:
    now = now or datetime.now(timezone.utc)
    ranked = []
    for task in tasks:
        if task["status"] != "PENDING":
            continue
        score = {"HIGH": 30, "MEDIUM": 20, "LOW": 10}.get(task["priority"], 10)
        reason = "Based on priority"
        if task.get("dueAt"):
            due = datetime.fromisoformat(task["dueAt"].replace("Z", "+00:00"))
            hours = (due - now).total_seconds() / 3600
            if hours < 0:
                score += 40
                reason = "Overdue task"
            elif hours <= 24:
                score += 30
                reason = "Due within 24 hours"
            elif hours <= 72:
                score += 15
                reason = "Due within 3 days"
        ranked.append((score, task, reason))
    ranked.sort(key=lambda x: (-x[0], x[1].get("dueAt") or "9999", x[1]["id"]))
    remaining = available_minutes
    result = []
    for score, task, reason in ranked:
        if remaining <= 0:
            break
        minutes = min(remaining, task["estimatedMinutes"])
        result.append(Recommendation(taskId=task["id"], title=task["title"], score=score,
                                     suggestedMinutes=minutes, reason=reason))
        remaining -= minutes
    return result

# Fetch tasks from the task service
async def fetch_tasks() -> list[dict[str, Any]]:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"{TASK_SERVICE_URL}/api/tasks")
            response.raise_for_status()
            return response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Task service temporarily unavailable") from exc

#health check endpoint to verify if the service is alive
@app.get("/health/live")
def live():
    return {"status": "ok"}

#health check endpoint to verify if the service is ready to handle requests
@app.get("/health/ready")
def ready():
    return {"status": "ok"}


#/Get today's task recommendations
@app.get("/api/planner/today")
async def today(availableMinutes: int = Query(90, ge=1, le=480)):
    tasks = await fetch_tasks()
    recommendations = rank(tasks, availableMinutes)
    return {"availableMinutes": availableMinutes, "recommendations": [r.model_dump() for r in recommendations],
            "message": "Start with the first task, then take a short break." if recommendations else "All caught up!"}

#get progress of tasks
@app.get("/api/planner/progress")
async def progress():
    tasks = await fetch_tasks()
    completed = sum(t["status"] == "COMPLETED" for t in tasks)
    return {"total": len(tasks), "completed": completed, "pending": len(tasks) - completed}
