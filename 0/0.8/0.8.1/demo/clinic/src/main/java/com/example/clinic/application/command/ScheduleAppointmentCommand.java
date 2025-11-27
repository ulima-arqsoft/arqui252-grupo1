package com.example.clinic.application.command;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ScheduleAppointmentCommand {
    private Long patientId;
    private LocalDateTime scheduledAt;
    private String reason;
}
