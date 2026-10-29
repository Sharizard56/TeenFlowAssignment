package com.teenflow.tasks;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TaskRepository extends JpaRepository<Task, UUID> {
 List<Task> findAllByOrderByCreatedAtDesc();
}
