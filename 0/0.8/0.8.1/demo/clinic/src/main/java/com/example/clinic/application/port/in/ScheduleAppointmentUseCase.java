package com.example.clinic.application.port.in;

import com.example.clinic.application.command.ScheduleAppointmentCommand;
import com.example.clinic.application.dto.AppointmentDto;

public interface ScheduleAppointmentUseCase {
    AppointmentDto schedule(ScheduleAppointmentCommand command);
}