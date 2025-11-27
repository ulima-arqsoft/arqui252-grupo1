package com.example.clinic.adapters.out.persistence.entity;

import java.time.LocalDateTime;

import com.example.clinic.domain.model.Appointment;
import com.example.clinic.domain.model.AppointmentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "appointment")
@Getter
@Setter
public class AppointmentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private PatientJpaEntity patient;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "status", nullable = false)
    private String status;

    @Column
    private String reason;

    public Appointment toDomain() {
        return new Appointment(
                id,
                patient.toDomain(),
                scheduledAt,
                AppointmentStatus.valueOf(status),
                reason
        );
    }

    public static AppointmentJpaEntity fromDomain(Appointment appointment) {
        var entity = new AppointmentJpaEntity();
        entity.setId(appointment.getId());
        entity.setPatient(PatientJpaEntity.fromDomain(appointment.getPatient()));
        entity.setScheduledAt(appointment.getScheduledAt());
        entity.setStatus(appointment.getStatus().name());
        entity.setReason(appointment.getReason());
        return entity;
    }
}
