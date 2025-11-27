package com.example.clinic.application.service;

import com.example.clinic.application.port.in.CancelAppointmentUseCase;
import com.example.clinic.domain.port.out.AppointmentRepositoryPort;

public class CancelAppointmentService implements CancelAppointmentUseCase {

    private final AppointmentRepositoryPort appointmentRepositoryPort;

    public CancelAppointmentService(AppointmentRepositoryPort appointmentRepositoryPort) {
        this.appointmentRepositoryPort = appointmentRepositoryPort;
    }

    @Override
    public void cancel(Long appointmentId) {
        var appointment = appointmentRepositoryPort.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        appointment.cancel();

        appointmentRepositoryPort.save(appointment);
    }
}
