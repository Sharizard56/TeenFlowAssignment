CREATE TABLE tasks (
 id UUID PRIMARY KEY,
 title VARCHAR(120) NOT NULL,
 description VARCHAR(1000),
 subject VARCHAR(60),
 priority VARCHAR(10) NOT NULL CHECK (priority IN ('LOW','MEDIUM','HIGH')),
 status VARCHAR(12) NOT NULL CHECK (status IN ('PENDING','COMPLETED')),
 due_at TIMESTAMPTZ,
 estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes BETWEEN 1 AND 480),
 created_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL,
 completed_at TIMESTAMPTZ
);
CREATE INDEX idx_tasks_status_due ON tasks(status, due_at);
