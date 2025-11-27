package com.example.clinic.application.port.in;

import java.util.List;

import com.example.clinic.application.dto.AppointmentDto;

public interface ListAppointmentsUseCase {
    List<AppointmentDto> listAll();
    List<AppointmentDto> listByPatient(Long patientId);
}