package com.teenflow.tasks;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class TaskControllerTest {
 @Test void createsTask() {
  TaskRepository repo=mock(TaskRepository.class);
  when(repo.save(any(Task.class))).thenAnswer(inv->inv.getArgument(0));
  var response=new TaskController(repo).create(new TaskInput("Math",null,"Math","HIGH",null,30));
  assertEquals(HttpStatus.CREATED,response.getStatusCode());
  assertEquals("PENDING",response.getBody().status);
  assertNotNull(response.getBody().id);
 }
 @Test void missingTaskReturns404() {
  TaskRepository repo=mock(TaskRepository.class);
  when(repo.findById(any())).thenReturn(Optional.empty());
  var error=assertThrows(ResponseStatusException.class,()->new TaskController(repo).get(UUID.randomUUID()));
  assertEquals(HttpStatus.NOT_FOUND,error.getStatusCode());
 }
}
