package com.example.clinic.application.dto;

import java.time.LocalDateTime;

import com.example.clinic.domain.model.Appointment;
import com.example.clinic.domain.model.AppointmentStatus;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AppointmentDto {
    Long id;
    Long patientId;
    String patientName;
    LocalDateTime scheduledAt;
    AppointmentStatus status;
    String reason;

    public static AppointmentDto fromDomain(Appointment appointment) {
        return AppointmentDto.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFullName())
                .scheduledAt(appointment.getScheduledAt())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .build();
    }
}
