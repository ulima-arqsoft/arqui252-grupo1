package com.example.clinic.domain.model;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Appointment {

    private Long id;
    private Patient patient;
    private LocalDateTime scheduledAt;
    private AppointmentStatus status;
    private String reason;

    public Appointment(Long id,
                       Patient patient,
                       LocalDateTime scheduledAt,
                       AppointmentStatus status,
                       String reason) {

        if (patient == null) {
            throw new IllegalArgumentException("Patient is required");
        }
        if (scheduledAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Appointment cannot be in the past");
        }

        this.id = id;
        this.patient = patient;
        this.scheduledAt = scheduledAt;
        this.status = status;
        this.reason = reason;
    }

    public void cancel() {
        if (this.status == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Appointment already cancelled");
        }
        if (this.status == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Appointment already completed");
        }
        this.status = AppointmentStatus.CANCELLED;
    }
}
