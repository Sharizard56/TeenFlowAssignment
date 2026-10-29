package com.teenflow.tasks;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity
@Table(name="tasks")
public class Task {
 @Id public UUID id;
 @Column(nullable=false, length=120) public String title;
 @Column(length=1000) public String description;
 @Column(length=60) public String subject;
 @Column(nullable=false, length=10) public String priority;
 @Column(nullable=false, length=12) public String status;
 @Column(name="due_at") public Instant dueAt;
 @Column(name="estimated_minutes",nullable=false) public Integer estimatedMinutes;
 @Column(name="created_at",nullable=false) public Instant createdAt;
 @Column(name="updated_at",nullable=false) public Instant updatedAt;
 @Column(name="completed_at") public Instant completedAt;
}
