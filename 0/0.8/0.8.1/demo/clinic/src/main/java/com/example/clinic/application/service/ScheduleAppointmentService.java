package com.example.clinic.application.service;

import com.example.clinic.application.command.ScheduleAppointmentCommand;
import com.example.clinic.application.dto.AppointmentDto;
import com.example.clinic.application.port.in.ScheduleAppointmentUseCase;
import com.example.clinic.domain.model.Appointment;
import com.example.clinic.domain.model.AppointmentStatus;
import com.example.clinic.domain.port.out.AppointmentRepositoryPort;
import com.example.clinic.domain.port.out.PatientRepositoryPort;

public class ScheduleAppointmentService implements ScheduleAppointmentUseCase {

    private final AppointmentRepositoryPort appointmentRepositoryPort;
    private final PatientRepositoryPort patientRepositoryPort;

    public ScheduleAppointmentService(AppointmentRepositoryPort appointmentRepositoryPort,
                                      PatientRepositoryPort patientRepositoryPort) {
        this.appointmentRepositoryPort = appointmentRepositoryPort;
        this.patientRepositoryPort = patientRepositoryPort;
    }

    @Override
    public AppointmentDto schedule(ScheduleAppointmentCommand command) {
        var patient = patientRepositoryPort.findById(command.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        var appointment = new Appointment(
                null,
                patient,
                command.getScheduledAt(),
                AppointmentStatus.SCHEDULED,
                command.getReason()
        );

        var saved = appointmentRepositoryPort.save(appointment);
        return AppointmentDto.fromDomain(saved);
    }
}
