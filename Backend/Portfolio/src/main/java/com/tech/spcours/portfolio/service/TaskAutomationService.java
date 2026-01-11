package com.tech.spcours.portfolio.service;

import com.tech.spcours.portfolio.config.AdminProperties;
import com.tech.spcours.portfolio.model.Task;
import com.tech.spcours.portfolio.model.TaskStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskAutomationService {
    private static final Logger logger = LoggerFactory.getLogger(TaskAutomationService.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final TaskService taskService;
    private final JavaMailSender mailSender;
    private final AdminProperties adminProperties;
    private final String mailUsername;
    private final ZoneId zoneId;

    public TaskAutomationService(
            TaskService taskService,
            JavaMailSender mailSender,
            AdminProperties adminProperties,
            @Value("${app.reminders.timezone:Asia/Colombo}") String timeZone,
            @Value("${spring.mail.username:}") String mailUsername) {
        this.taskService = taskService;
        this.mailSender = mailSender;
        this.adminProperties = adminProperties;
        this.mailUsername = mailUsername;
        ZoneId resolvedZone;
        try {
            resolvedZone = ZoneId.of(timeZone);
        } catch (Exception ex) {
            resolvedZone = ZoneId.systemDefault();
        }
        this.zoneId = resolvedZone;
    }

    @Scheduled(cron = "${app.reminders.carry-forward-cron:0 5 0 * * *}", zone = "${app.reminders.timezone:Asia/Colombo}")
    public void carryForwardTasks() {
        int carried = taskService.carryForwardOverdueTasks();
        if (carried > 0) {
            logger.info("Carried forward {} tasks to today.", carried);
        }
    }

    @Scheduled(cron = "${app.reminders.daily-cron:0 0 8 * * *}", zone = "${app.reminders.timezone:Asia/Colombo}")
    public void sendDailyDigest() {
        if (!canSendMail()) {
            return;
        }
        List<Task> tasks = taskService.findTasksForDate(LocalDate.now(zoneId))
                .stream()
                .filter(Task::isReminderEnabled)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .collect(Collectors.toList());
        if (tasks.isEmpty()) {
            return;
        }
        String body = buildTaskList("Today's tasks", tasks);
        sendMail("Daily Task Digest", body);
    }

    @Scheduled(cron = "${app.reminders.overdue-cron:0 15 8 * * *}", zone = "${app.reminders.timezone:Asia/Colombo}")
    public void sendOverdueAlerts() {
        if (!canSendMail()) {
            return;
        }
        List<Task> tasks = taskService.findOverdueTasks(LocalDate.now(zoneId))
                .stream()
                .filter(Task::isReminderEnabled)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .collect(Collectors.toList());
        if (tasks.isEmpty()) {
            return;
        }
        String body = buildTaskList("Overdue tasks", tasks);
        sendMail("Overdue Task Alert", body);
    }

    @Scheduled(cron = "${app.reminders.monthly-cron:0 30 8 1 * *}", zone = "${app.reminders.timezone:Asia/Colombo}")
    public void sendMonthlySummary() {
        if (!canSendMail()) {
            return;
        }
        List<Task> tasks = taskService.getAllTaskEntities()
                .stream()
                .filter(Task::isReminderEnabled)
                .collect(Collectors.toList());
        if (tasks.isEmpty()) {
            return;
        }
        String body = buildTaskList("Monthly summary", tasks);
        sendMail("Monthly Task Summary", body);
    }

    @Scheduled(cron = "${app.reminders.task-cron:0 * * * * *}", zone = "${app.reminders.timezone:Asia/Colombo}")
    public void sendTimedTaskReminders() {
        if (!canSendMail()) {
            return;
        }
        LocalDate today = LocalDate.now(zoneId);
        LocalTime now = LocalTime.now(zoneId).truncatedTo(ChronoUnit.MINUTES);
        List<Task> tasks = taskService.findTasksForDate(today)
                .stream()
                .filter(Task::isReminderEnabled)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .filter(task -> task.getReminderTime() != null)
                .filter(task -> task.getReminderTime().truncatedTo(ChronoUnit.MINUTES).equals(now))
                .filter(task -> !wasSentForTime(task, today, now))
                .collect(Collectors.toList());
        if (tasks.isEmpty()) {
            return;
        }
        String body = buildTaskList("Task reminders", tasks);
        sendMail("Task Reminder", body);
        LocalDateTime sentAt = LocalDateTime.now(zoneId);
        tasks.forEach(task -> task.setLastReminderSentAt(sentAt));
        taskService.saveTasks(tasks);
    }

    private boolean canSendMail() {
        if (!StringUtils.hasText(mailUsername)) {
            logger.debug("Mail credentials not configured. Skipping task reminders.");
            return false;
        }
        if (!StringUtils.hasText(adminProperties.getEmail())) {
            logger.warn("Admin email is missing. Skipping task reminders.");
            return false;
        }
        return true;
    }

    private void sendMail(String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (StringUtils.hasText(mailUsername)) {
                message.setFrom(mailUsername);
            }
            message.setTo(adminProperties.getEmail());
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException ex) {
            logger.warn("Failed to send task reminder email: {}", ex.getMessage());
        }
    }

    private String buildTaskList(String heading, List<Task> tasks) {
        String list = tasks.stream()
                .map(task -> formatTask(task))
                .collect(Collectors.joining("\n"));
        return heading + " (" + DATE_FORMAT.format(LocalDate.now(zoneId)) + ")\n\n" + list;
    }

    private boolean wasSentForTime(Task task, LocalDate today, LocalTime now) {
        LocalDateTime lastSent = task.getLastReminderSentAt();
        if (lastSent == null) {
            return false;
        }
        return lastSent.toLocalDate().isEqual(today)
                && lastSent.toLocalTime().truncatedTo(ChronoUnit.MINUTES).equals(now);
    }

    private String formatTask(Task task) {
        String due = task.getDueDate() == null ? "No due date" : DATE_FORMAT.format(task.getDueDate());
        String reminder = task.getReminderTime() == null ? "" : " @ " + TIME_FORMAT.format(task.getReminderTime());
        return "- " + task.getTitle() + " [" + task.getStatus() + "] (Due: " + due + reminder + ")";
    }
}
