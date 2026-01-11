package com.tech.spcours.portfolio.repository;

import com.tech.spcours.portfolio.model.Task;
import com.tech.spcours.portfolio.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    long countByStatus(TaskStatus status);

    long countByDueDate(LocalDate dueDate);

    long countByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);

    List<Task> findByScheduledDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
}
