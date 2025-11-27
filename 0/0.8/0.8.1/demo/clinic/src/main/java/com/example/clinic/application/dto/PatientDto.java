package com.example.clinic.application.dto;

import com.example.clinic.domain.model.Patient;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PatientDto {
    Long id;
    String documentNumber;
    String fullName;
    String email;
    String phone;

    public static PatientDto fromDomain(Patient patient) {
        return PatientDto.builder()
                .id(patient.getId())
                .documentNumber(patient.getDocumentNumber())
                .fullName(patient.getFullName())
                .email(patient.getEmail())
                .phone(patient.getPhone())
                .build();
    }
}
