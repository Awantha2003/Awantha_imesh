package com.tech.spcours.portfolio.service;

import com.tech.spcours.portfolio.config.AdminProperties;
import com.tech.spcours.portfolio.model.Task;
import com.tech.spcours.portfolio.model.TaskStatus;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class TaskAutomationService {
    private static final Logger logger = LoggerFactory.getLogger(TaskAutomationService.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final int DESCRIPTION_SNIPPET_LIMIT = 160;

    private enum EmailVariant {
        DAILY("Daily Digest", "#1B7C6E"),
        OVERDUE("Overdue Alert", "#A63D40"),
        MONTHLY("Monthly Summary", "#2E6E4F"),
        REMINDER("Task Reminder", "#3B5BDB");

        private final String label;
        private final String accentColor;

        EmailVariant(String label, String accentColor) {
            this.label = label;
            this.accentColor = accentColor;
        }

        private String getLabel() {
            return label;
        }

        private String getAccentColor() {
            return accentColor;
        }
    }

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
        LocalDate today = LocalDate.now(zoneId);
        List<Task> tasks = taskService.findTasksForDate(today)
                .stream()
                .filter(Task::isReminderEnabled)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .collect(Collectors.toList());
        if (tasks.isEmpty()) {
            return;
        }
        String textBody = buildTaskList("Today's tasks", tasks, today);
        String summary = formatCount("task", tasks.size()) + " scheduled for today.";
        String htmlBody = buildHtmlEmail(EmailVariant.DAILY, "Daily Task Digest",
                "Here is your plan for today.", summary,
                "Tip: Start with a high-priority item to build momentum.", tasks, today);
        sendMail("Daily Task Digest", textBody, htmlBody);
    }

    @Scheduled(cron = "${app.reminders.overdue-cron:0 15 8 * * *}", zone = "${app.reminders.timezone:Asia/Colombo}")
    public void sendOverdueAlerts() {
        if (!canSendMail()) {
            return;
        }
        LocalDate today = LocalDate.now(zoneId);
        List<Task> tasks = taskService.findOverdueTasks(today)
                .stream()
                .filter(Task::isReminderEnabled)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .collect(Collectors.toList());
        if (tasks.isEmpty()) {
            return;
        }
        String textBody = buildTaskList("Overdue tasks", tasks, today);
        String summary = formatCount("task", tasks.size()) + " past due.";
        String htmlBody = buildHtmlEmail(EmailVariant.OVERDUE, "Overdue Task Alert",
                "A quick review now can reset the day.", summary,
                "Tip: Pick one quick win to reduce the list.", tasks, today);
        sendMail("Overdue Task Alert", textBody, htmlBody);
    }

    @Scheduled(cron = "${app.reminders.monthly-cron:0 30 8 1 * *}", zone = "${app.reminders.timezone:Asia/Colombo}")
    public void sendMonthlySummary() {
        if (!canSendMail()) {
            return;
        }
        LocalDate today = LocalDate.now(zoneId);
        List<Task> tasks = taskService.getAllTaskEntities()
                .stream()
                .filter(Task::isReminderEnabled)
                .collect(Collectors.toList());
        if (tasks.isEmpty()) {
            return;
        }
        String textBody = buildTaskList("Monthly summary", tasks, today);
        String summary = formatCount("task", tasks.size()) + " in your list. " + buildStatusSummary(tasks);
        String htmlBody = buildHtmlEmail(EmailVariant.MONTHLY, "Monthly Task Summary",
                "A snapshot of everything on your radar.", summary,
                "Tip: Review pending items and set priorities for the new month.", tasks, today);
        sendMail("Monthly Task Summary", textBody, htmlBody);
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
        String textBody = buildTaskList("Task reminders", tasks, today);
        String summary = "Reminder time: " + TIME_FORMAT.format(now) + " (" + zoneId + ").";
        String htmlBody = buildHtmlEmail(EmailVariant.REMINDER, "Task Reminder",
                "This is your scheduled reminder.", summary,
                "Tip: Tackle the smallest task first to build momentum.", tasks, today);
        sendMail("Task Reminder", textBody, htmlBody);
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

    private void sendMail(String subject, String textBody, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            if (StringUtils.hasText(mailUsername)) {
                helper.setFrom(mailUsername);
            }
            helper.setTo(adminProperties.getEmail());
            helper.setSubject(subject);
            helper.setText(textBody, htmlBody);
            mailSender.send(message);
        } catch (MailException | MessagingException ex) {
            logger.warn("Failed to send task reminder email: {}", ex.getMessage());
        }
    }

    private String buildTaskList(String heading, List<Task> tasks, LocalDate date) {
        String list = tasks.stream()
                .map(task -> formatTask(task))
                .collect(Collectors.joining("\n"));
        return heading + " (" + DATE_FORMAT.format(date) + ")\n\n" + list;
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
        String status = formatLabel(task.getStatus());
        String priority = formatLabel(task.getPriority());
        String due = task.getDueDate() == null ? "none" : DATE_FORMAT.format(task.getDueDate());
        String reminder = task.getReminderTime() == null ? "" : " | Reminder: " + TIME_FORMAT.format(task.getReminderTime());
        return "- " + task.getTitle() + " [" + status + " | " + priority + "] (Due: " + due + reminder + ")";
    }

    private String buildHtmlEmail(EmailVariant variant, String title, String intro, String summaryLine, String tipLine,
                                  List<Task> tasks, LocalDate date) {
        String safeTitle = escapeHtml(title);
        String safeIntro = escapeHtml(intro);
        String safeSummary = escapeHtml(summaryLine);
        String safeTip = escapeHtml(tipLine);
        String safeLabel = escapeHtml(variant.getLabel());
        String safeDate = escapeHtml(DATE_FORMAT.format(date));
        String taskCards = tasks.stream()
                .map(task -> buildTaskCard(task, variant, date))
                .collect(Collectors.joining());
        String countLine = formatCount("task", tasks.size());

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset=\"UTF-8\"></head>");
        html.append("<body style=\"margin:0; padding:0; background-color:#F7F4EF;\">");
        html.append("<div style=\"display:none; max-height:0; overflow:hidden; opacity:0;\">");
        html.append(safeSummary);
        html.append("</div>");
        html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" ");
        html.append("style=\"background-color:#F7F4EF; padding:24px 0;\">");
        html.append("<tr><td align=\"center\">");
        html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" ");
        html.append("style=\"width:100%; max-width:600px; font-family:'Trebuchet MS', Arial, sans-serif;\">");
        html.append("<tr><td style=\"background-color:#FFFFFF; border-radius:16px; overflow:hidden; ");
        html.append("border:1px solid #E6E1D8;\">");
        html.append("<div style=\"background-color:");
        html.append(variant.getAccentColor());
        html.append("; padding:20px 24px;\">");
        html.append("<div style=\"font-size:12px; letter-spacing:1px; text-transform:uppercase; ");
        html.append("color:#F7F4EF;\">");
        html.append(safeLabel);
        html.append("</div>");
        html.append("<div style=\"font-size:24px; font-weight:700; color:#FFFFFF; margin-top:6px;\">");
        html.append(safeTitle);
        html.append("</div>");
        html.append("<div style=\"font-size:13px; color:#F2EFEA; margin-top:8px;\">");
        html.append(safeIntro);
        html.append("</div>");
        html.append("</div>");
        html.append("<div style=\"padding:22px 24px 10px 24px;\">");
        html.append("<div style=\"font-size:14px; color:#2B2B2B; margin-bottom:6px;\">");
        html.append(safeSummary);
        html.append("</div>");
        html.append("<div style=\"font-size:12px; color:#6A6A6A; margin-bottom:16px;\">");
        html.append(safeDate);
        html.append(" | ");
        html.append(escapeHtml(countLine));
        html.append("</div>");
        html.append(taskCards);
        html.append("</div>");
        html.append("<div style=\"background-color:#F8F6F2; border-top:1px solid #E6E1D8; ");
        html.append("padding:14px 24px; font-size:12px; color:#6A6A6A;\">");
        html.append(safeTip);
        html.append("</div>");
        html.append("</td></tr></table></td></tr></table></body></html>");
        return html.toString();
    }

    private String buildTaskCard(Task task, EmailVariant variant, LocalDate today) {
        String title = escapeHtml(task.getTitle());
        String meta = escapeHtml(buildTaskMeta(task, variant, today));
        String description = "";
        if (StringUtils.hasText(task.getDescription())) {
            String snippet = task.getDescription().trim();
            if (snippet.length() > DESCRIPTION_SNIPPET_LIMIT) {
                snippet = snippet.substring(0, DESCRIPTION_SNIPPET_LIMIT - 3) + "...";
            }
            description = "<div style=\"font-size:13px; color:#3F3F3F; margin-top:8px;\">"
                    + escapeHtml(snippet) + "</div>";
        }
        StringBuilder card = new StringBuilder();
        card.append("<div style=\"border-left:4px solid ");
        card.append(priorityColor(task));
        card.append("; border:1px solid #EFE9DF; border-radius:12px; ");
        card.append("padding:12px 14px; margin-bottom:12px; background-color:#FFFFFF;\">");
        card.append("<div style=\"font-size:16px; font-weight:700; color:#1E1E1E; margin-bottom:6px;\">");
        card.append(title);
        card.append("</div>");
        card.append("<div style=\"margin-bottom:6px;\">");
        card.append(buildBadge("Status: " + formatLabel(task.getStatus()), "#EFF3F6", "#2F3A44"));
        card.append(buildBadge("Priority: " + formatLabel(task.getPriority()), "#F6EFE7", priorityColor(task)));
        card.append("</div>");
        card.append("<div style=\"font-size:12px; color:#6A6A6A;\">");
        card.append(meta);
        card.append("</div>");
        card.append(description);
        card.append("</div>");
        return card.toString();
    }

    private String buildBadge(String text, String backgroundColor, String textColor) {
        return "<span style=\"display:inline-block; background-color:" + backgroundColor
                + "; color:" + textColor
                + "; font-size:11px; padding:2px 8px; border-radius:999px; margin-right:6px;\">"
                + escapeHtml(text) + "</span>";
    }

    private String buildTaskMeta(Task task, EmailVariant variant, LocalDate today) {
        List<String> meta = new ArrayList<>();
        if (task.getDueDate() != null) {
            meta.add("Due: " + DATE_FORMAT.format(task.getDueDate()));
        } else if (task.getScheduledDate() != null) {
            meta.add("Scheduled: " + DATE_FORMAT.format(task.getScheduledDate()));
        } else {
            meta.add("No due date");
        }
        if (task.getReminderTime() != null) {
            meta.add("Reminder: " + TIME_FORMAT.format(task.getReminderTime()));
        }
        if (variant == EmailVariant.OVERDUE && task.getDueDate() != null) {
            long daysOverdue = ChronoUnit.DAYS.between(task.getDueDate(), today);
            if (daysOverdue > 0) {
                meta.add("Overdue: " + daysOverdue + " day(s)");
            }
        }
        return String.join(" | ", meta);
    }

    private String buildStatusSummary(List<Task> tasks) {
        long todo = tasks.stream().filter(task -> task.getStatus() == TaskStatus.TODO).count();
        long inProgress = tasks.stream().filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS).count();
        long completed = tasks.stream().filter(task -> task.getStatus() == TaskStatus.COMPLETED).count();
        long pending = tasks.stream().filter(task -> task.getStatus() == TaskStatus.PENDING).count();
        return "Status mix: " + todo + " todo, " + inProgress + " in progress, " + completed
                + " completed, " + pending + " pending.";
    }

    private String formatCount(String noun, int count) {
        String suffix = count == 1 ? "" : "s";
        return count + " " + noun + suffix;
    }

    private String formatLabel(Enum<?> value) {
        if (value == null) {
            return "";
        }
        String raw = value.name().toLowerCase(Locale.US).replace('_', ' ');
        return Character.toUpperCase(raw.charAt(0)) + raw.substring(1);
    }

    private String priorityColor(Task task) {
        if (task.getPriority() == null) {
            return "#5B6B5B";
        }
        return switch (task.getPriority()) {
            case URGENT -> "#B42318";
            case HIGH -> "#B54708";
            case MEDIUM -> "#2F7E56";
            case LOW -> "#3B5BDB";
        };
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("&", "&amp;");
        escaped = escaped.replace("<", "&lt;");
        escaped = escaped.replace(">", "&gt;");
        escaped = escaped.replace("\"", "&quot;");
        return escaped.replace("'", "&#39;");
    }
}
