from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app, rank


def test_priority_and_urgency():
    now = datetime(2026, 10, 10, tzinfo=timezone.utc)
    tasks = [
        {"id": "low", "title": "Read", "priority": "LOW", "status": "PENDING", "estimatedMinutes": 20, "dueAt": None},
        {"id": "urgent", "title": "Math", "priority": "HIGH", "status": "PENDING", "estimatedMinutes": 40, "dueAt": "2026-10-10T12:00:00Z"},
    ]
    result = rank(tasks, 30, now)
    assert len(result) == 1
    assert result[0].taskId == "urgent"
    assert result[0].suggestedMinutes == 30


def test_live_endpoint():
    assert TestClient(app).get("/health/live").json() == {"status": "ok"}


def test_completed_tasks_ignored():
    assert rank([{"id":"1","title":"Done","priority":"HIGH","status":"COMPLETED","estimatedMinutes":20}], 90) == []
