package com.teenflow.tasks;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
@RestController


@RequestMapping("/api/tasks")
public class TaskController {
 private final TaskRepository repo;
 public TaskController(TaskRepository repo) { this.repo = repo; }
 
 //List all tasks, get a task by ID, create a new task, update an existing task, mark a task as complete, and delete a task.
 @GetMapping public List<Task> list() { return repo.findAllByOrderByCreatedAtDesc(); }

 //Get a task by ID
 @GetMapping("/{id}") public Task get(@PathVariable UUID id) { return find(id); }

 //Create a new task
 @PostMapping public ResponseEntity<Task> create(@Valid @RequestBody TaskInput input) {
  Task t = new Task(); t.id = UUID.randomUUID(); t.status="PENDING";
  t.createdAt=Instant.now(); t.updatedAt=t.createdAt; apply(t,input);
  return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(t));
 }

 //Update an existing task
 @PutMapping("/{id}") public Task update(@PathVariable UUID id,@Valid @RequestBody TaskInput input) {
  Task t=find(id); apply(t,input); t.updatedAt=Instant.now(); return repo.save(t);
 }

 //Mark a task as complete
 @PatchMapping("/{id}/complete") public Task complete(@PathVariable UUID id) {
  Task t=find(id); t.status="COMPLETED"; t.completedAt=Instant.now(); t.updatedAt=t.completedAt;
  return repo.save(t);
 }

 //Delete a task
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
 public void delete(@PathVariable UUID id) { Task t=find(id); repo.delete(t); }
 private Task find(UUID id) { return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Task not found")); }
 private void apply(Task t,TaskInput i) {
  t.title=i.title().trim(); t.description=i.description(); t.subject=i.subject();
  t.priority=i.priority(); t.dueAt=i.dueAt(); t.estimatedMinutes=i.estimatedMinutes();
 }
}
