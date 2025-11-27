package com.example.clinic.adapters.out.persistence;

import java.util.List;
import java.util.Optional;

import com.example.clinic.adapters.out.persistence.entity.AppointmentJpaEntity;
import com.example.clinic.domain.model.Appointment;
import com.example.clinic.domain.port.out.AppointmentRepositoryPort;

public class AppointmentRepositoryAdapter implements AppointmentRepositoryPort {

    private final SpringDataAppointmentRepository springDataAppointmentRepository;

    public AppointmentRepositoryAdapter(SpringDataAppointmentRepository springDataAppointmentRepository) {
        this.springDataAppointmentRepository = springDataAppointmentRepository;
    }

    @Override
    public Appointment save(Appointment appointment) {
        var entity = AppointmentJpaEntity.fromDomain(appointment);
        var saved = springDataAppointmentRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Appointment> findById(Long id) {
        return springDataAppointmentRepository.findById(id)
                .map(AppointmentJpaEntity::toDomain);
    }

    @Override
    public List<Appointment> findAll() {
        return springDataAppointmentRepository.findAll().stream()
                .map(AppointmentJpaEntity::toDomain)
                .toList();
    }

    @Override
    public List<Appointment> findByPatientId(Long patientId) {
        return springDataAppointmentRepository.findByPatientId(patientId).stream()
                .map(AppointmentJpaEntity::toDomain)
                .toList();
    }
}
