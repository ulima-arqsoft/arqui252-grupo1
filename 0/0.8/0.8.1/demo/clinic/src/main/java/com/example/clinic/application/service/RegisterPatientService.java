package com.example.clinic.application.service;

import com.example.clinic.application.command.RegisterPatientCommand;
import com.example.clinic.application.dto.PatientDto;
import com.example.clinic.application.port.in.RegisterPatientUseCase;
import com.example.clinic.domain.model.Patient;
import com.example.clinic.domain.port.out.PatientRepositoryPort;

public class RegisterPatientService implements RegisterPatientUseCase {

    private final PatientRepositoryPort patientRepositoryPort;

    public RegisterPatientService(PatientRepositoryPort patientRepositoryPort) {
        this.patientRepositoryPort = patientRepositoryPort;
    }

    @Override
    public PatientDto register(RegisterPatientCommand command) {
        var existing = patientRepositoryPort.findByDocumentNumber(command.getDocumentNumber());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Patient with this document already exists");
        }

        var patient = new Patient(
                null,
                command.getDocumentNumber(),
                command.getFullName(),
                command.getEmail(),
                command.getPhone()
        );

        var saved = patientRepositoryPort.save(patient);
        return PatientDto.fromDomain(saved);
    }
}
