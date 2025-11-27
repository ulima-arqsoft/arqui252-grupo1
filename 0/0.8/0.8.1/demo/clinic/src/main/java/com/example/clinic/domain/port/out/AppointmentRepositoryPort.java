package com.example.clinic.domain.port.out;

import java.util.List;
import java.util.Optional;

import com.example.clinic.domain.model.Appointment;

public interface AppointmentRepositoryPort {

    Appointment save(Appointment appointment);

    Optional<Appointment> findById(Long id);

    List<Appointment> findAll();

    List<Appointment> findByPatientId(Long patientId);
}
