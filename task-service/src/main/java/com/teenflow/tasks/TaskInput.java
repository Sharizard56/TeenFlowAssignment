package com.teenflow.tasks;
import jakarta.validation.constraints.*;
import java.time.Instant;
public record TaskInput(
 @NotBlank @Size(max=120) String title,
 @Size(max=1000) String description,
 @Size(max=60) String subject,
 @NotNull @Pattern(regexp="LOW|MEDIUM|HIGH") String priority,
 Instant dueAt,
 @NotNull @Min(1) @Max(480) Integer estimatedMinutes
) {}
