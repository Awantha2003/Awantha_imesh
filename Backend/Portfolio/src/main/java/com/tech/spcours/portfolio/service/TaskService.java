package com.tech.spcours.portfolio.service;

import com.tech.spcours.portfolio.dto.TaskDashboardResponse;
import com.tech.spcours.portfolio.dto.TaskRequest;
import com.tech.spcours.portfolio.dto.TaskResponse;
import com.tech.spcours.portfolio.model.Task;
import com.tech.spcours.portfolio.model.TaskPriority;
import com.tech.spcours.portfolio.model.TaskRecurrence;
import com.tech.spcours.portfolio.model.TaskStatus;
import com.tech.spcours.portfolio.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskResponse createTask(TaskRequest request) {
        Task task = new Task();
        applyRequest(task, request);
        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        applyRequest(task, request);
        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
        taskRepository.deleteById(id);
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<Task> getAllTaskEntities() {
        return taskRepository.findAll();
    }

    public void saveTasks(List<Task> tasks) {
        taskRepository.saveAll(tasks);
    }

    public List<TaskResponse> getTodayTasks() {
        return findTasksForDate(LocalDate.now())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getOverdueTasks() {
        return findOverdueTasks(LocalDate.now())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TaskDashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        List<Task> tasks = taskRepository.findAll();
        TaskDashboardResponse response = new TaskDashboardResponse();
        response.setTotal(tasks.size());
        response.setTodo(countByStatus(tasks, TaskStatus.TODO));
        response.setInProgress(countByStatus(tasks, TaskStatus.IN_PROGRESS));
        response.setCompleted(countByStatus(tasks, TaskStatus.COMPLETED));
        response.setPending(countByStatus(tasks, TaskStatus.PENDING));
        response.setDueToday(tasks.stream()
                .filter(task -> isScheduledForDate(task, today) || isDueOn(task, today))
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .count());
        response.setOverdue(tasks.stream()
                .filter(task -> isOverdue(task, today))
                .count());
        response.setUpcoming(tasks.stream()
                .filter(task -> isUpcoming(task, today))
                .count());
        return response;
    }

    public int carryForwardOverdueTasks() {
        LocalDate today = LocalDate.now();
        List<Task> candidates = taskRepository.findByScheduledDateBeforeAndStatusNot(today, TaskStatus.COMPLETED);
        List<Task> carried = candidates.stream()
                .filter(task -> task.getRecurrence() == null || task.getRecurrence() == TaskRecurrence.NONE)
                .peek(task -> {
                    task.setScheduledDate(today);
                    if (task.getStatus() == TaskStatus.TODO || task.getStatus() == TaskStatus.IN_PROGRESS) {
                        task.setStatus(TaskStatus.PENDING);
                    }
                })
                .collect(Collectors.toList());
        if (!carried.isEmpty()) {
            taskRepository.saveAll(carried);
        }
        return carried.size();
    }

    public List<Task> findTasksForDate(LocalDate date) {
        return taskRepository.findAll()
                .stream()
                .filter(task -> isScheduledForDate(task, date) || isDueOn(task, date))
                .collect(Collectors.toList());
    }

    public List<Task> findOverdueTasks(LocalDate date) {
        return taskRepository.findAll()
                .stream()
                .filter(task -> isOverdue(task, date))
                .collect(Collectors.toList());
    }

    private long countByStatus(List<Task> tasks, TaskStatus status) {
        return tasks.stream().filter(task -> task.getStatus() == status).count();
    }

    private boolean isScheduledForDate(Task task, LocalDate date) {
        TaskRecurrence recurrence = task.getRecurrence();
        LocalDate scheduled = task.getScheduledDate();
        if (recurrence == TaskRecurrence.DAILY) {
            return true;
        }
        if (recurrence == TaskRecurrence.WEEKLY) {
            return scheduled != null && scheduled.getDayOfWeek() == date.getDayOfWeek();
        }
        if (recurrence == TaskRecurrence.MONTHLY) {
            return scheduled != null && scheduled.getDayOfMonth() == date.getDayOfMonth();
        }
        return scheduled != null && scheduled.isEqual(date);
    }

    private boolean isDueOn(Task task, LocalDate date) {
        return task.getDueDate() != null && task.getDueDate().isEqual(date);
    }

    private boolean isOverdue(Task task, LocalDate date) {
        return task.getDueDate() != null
                && task.getDueDate().isBefore(date)
                && task.getStatus() != TaskStatus.COMPLETED;
    }

    private boolean isUpcoming(Task task, LocalDate date) {
        return task.getDueDate() != null
                && task.getDueDate().isAfter(date)
                && task.getStatus() != TaskStatus.COMPLETED;
    }

    private void applyRequest(Task task, TaskRequest request) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() == null ? TaskStatus.TODO : request.getStatus());
        task.setPriority(request.getPriority() == null ? TaskPriority.MEDIUM : request.getPriority());
        task.setRecurrence(request.getRecurrence() == null ? TaskRecurrence.NONE : request.getRecurrence());
        task.setScheduledDate(request.getScheduledDate());
        task.setDueDate(request.getDueDate());
        task.setReminderEnabled(request.getReminderEnabled() == null || request.getReminderEnabled());
        task.setReminderTime(parseReminderTime(request.getReminderTime()));
        if (task.getStatus() == TaskStatus.COMPLETED) {
            if (task.getCompletedAt() == null) {
                task.setCompletedAt(LocalDateTime.now());
            }
        } else {
            task.setCompletedAt(null);
        }
    }

    private TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setRecurrence(task.getRecurrence());
        response.setScheduledDate(task.getScheduledDate());
        response.setDueDate(task.getDueDate());
        response.setReminderEnabled(task.isReminderEnabled());
        response.setReminderTime(formatReminderTime(task.getReminderTime()));
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        response.setCompletedAt(task.getCompletedAt());
        return response;
    }

    private LocalTime parseReminderTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalTime.parse(value);
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reminder time. Use HH:mm.");
        }
    }

    private String formatReminderTime(LocalTime value) {
        if (value == null) {
            return null;
        }
        return value.format(TIME_FORMAT);
    }
}
