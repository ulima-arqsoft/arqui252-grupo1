package com.example.clinic.adapters.out.persistence;

import java.util.Optional;

import com.example.clinic.adapters.out.persistence.entity.PatientJpaEntity;
import com.example.clinic.domain.model.Patient;
import com.example.clinic.domain.port.out.PatientRepositoryPort;

public class PatientRepositoryAdapter implements PatientRepositoryPort {

    private final SpringDataPatientRepository springDataPatientRepository;

    public PatientRepositoryAdapter(SpringDataPatientRepository springDataPatientRepository) {
        this.springDataPatientRepository = springDataPatientRepository;
    }

    @Override
    public Optional<Patient> findById(Long id) {
        return springDataPatientRepository.findById(id)
                .map(PatientJpaEntity::toDomain);
    }

    @Override
    public Optional<Patient> findByDocumentNumber(String documentNumber) {
        return springDataPatientRepository.findByDocumentNumber(documentNumber)
                .map(PatientJpaEntity::toDomain);
    }

    @Override
    public Patient save(Patient patient) {
        var entity = PatientJpaEntity.fromDomain(patient);
        var saved = springDataPatientRepository.save(entity);
        return saved.toDomain();
    }
}
