package com.example.clinic.application.service;

import java.util.List;

import com.example.clinic.application.dto.AppointmentDto;
import com.example.clinic.application.port.in.ListAppointmentsUseCase;
import com.example.clinic.domain.port.out.AppointmentRepositoryPort;

public class ListAppointmentsService implements ListAppointmentsUseCase {

    private final AppointmentRepositoryPort appointmentRepositoryPort;

    public ListAppointmentsService(AppointmentRepositoryPort appointmentRepositoryPort) {
        this.appointmentRepositoryPort = appointmentRepositoryPort;
    }

    @Override
    public List<AppointmentDto> listAll() {
        return appointmentRepositoryPort.findAll().stream()
                .map(AppointmentDto::fromDomain)
                .toList();
    }

    @Override
    public List<AppointmentDto> listByPatient(Long patientId) {
        return appointmentRepositoryPort.findByPatientId(patientId).stream()
                .map(AppointmentDto::fromDomain)
                .toList();
    }
}
