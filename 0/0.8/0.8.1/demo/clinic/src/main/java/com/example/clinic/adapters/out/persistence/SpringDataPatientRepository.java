package com.example.clinic.adapters.out.persistence;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.clinic.adapters.out.persistence.entity.PatientJpaEntity;

public interface SpringDataPatientRepository extends JpaRepository<PatientJpaEntity, Long> {
    Optional<PatientJpaEntity> findByDocumentNumber(String documentNumber);
}
