package com.example.clinic.adapters.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.clinic.adapters.out.persistence.entity.AppointmentJpaEntity;

public interface SpringDataAppointmentRepository extends JpaRepository<AppointmentJpaEntity, Long> {
    List<AppointmentJpaEntity> findByPatientId(Long patientId);
}
