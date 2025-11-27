package com.example.clinic.adapters.in.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.clinic.application.command.RegisterPatientCommand;
import com.example.clinic.application.dto.PatientDto;
import com.example.clinic.application.port.in.RegisterPatientUseCase;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final RegisterPatientUseCase registerPatientUseCase;

    public PatientController(RegisterPatientUseCase registerPatientUseCase) {
        this.registerPatientUseCase = registerPatientUseCase;
    }

    @PostMapping
    public ResponseEntity<PatientDto> register(@RequestBody RegisterPatientCommand command) {
        var result = registerPatientUseCase.register(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
}
