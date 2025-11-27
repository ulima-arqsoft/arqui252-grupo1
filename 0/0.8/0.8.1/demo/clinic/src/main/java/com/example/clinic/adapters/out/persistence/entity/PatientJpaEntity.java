package com.example.clinic.adapters.out.persistence.entity;

import com.example.clinic.domain.model.Patient;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "patient")
@Getter
@Setter
public class PatientJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_number", nullable = false, unique = true)
    private String documentNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column
    private String email;

    @Column
    private String phone;

    public Patient toDomain() {
        return new Patient(
                id,
                documentNumber,
                fullName,
                email,
                phone
        );
    }

    public static PatientJpaEntity fromDomain(Patient patient) {
        var entity = new PatientJpaEntity();
        entity.setId(patient.getId());
        entity.setDocumentNumber(patient.getDocumentNumber());
        entity.setFullName(patient.getFullName());
        entity.setEmail(patient.getEmail());
        entity.setPhone(patient.getPhone());
        return entity;
    }
}
