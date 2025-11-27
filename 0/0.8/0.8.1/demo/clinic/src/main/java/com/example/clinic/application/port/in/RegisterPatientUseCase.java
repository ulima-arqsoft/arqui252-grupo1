package com.example.clinic.application.port.in;

import com.example.clinic.application.command.RegisterPatientCommand;
import com.example.clinic.application.dto.PatientDto;

public interface RegisterPatientUseCase {
    PatientDto register(RegisterPatientCommand command);
}
