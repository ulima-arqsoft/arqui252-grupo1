package com.example.clinic.domain.port.out;

import java.util.Optional;

import com.example.clinic.domain.model.Patient;

public interface PatientRepositoryPort {

    Optional<Patient> findById(Long id);

    Optional<Patient> findByDocumentNumber(String documentNumber);

    Patient save(Patient patient);
}
