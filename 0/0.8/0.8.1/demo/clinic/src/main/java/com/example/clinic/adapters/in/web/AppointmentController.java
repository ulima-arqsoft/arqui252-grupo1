package com.example.clinic.adapters.in.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.clinic.application.command.ScheduleAppointmentCommand;
import com.example.clinic.application.dto.AppointmentDto;
import com.example.clinic.application.port.in.CancelAppointmentUseCase;
import com.example.clinic.application.port.in.ListAppointmentsUseCase;
import com.example.clinic.application.port.in.ScheduleAppointmentUseCase;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final ScheduleAppointmentUseCase scheduleAppointmentUseCase;
    private final ListAppointmentsUseCase listAppointmentsUseCase;
    private final CancelAppointmentUseCase cancelAppointmentUseCase;

    public AppointmentController(ScheduleAppointmentUseCase scheduleAppointmentUseCase,
                                 ListAppointmentsUseCase listAppointmentsUseCase,
                                 CancelAppointmentUseCase cancelAppointmentUseCase) {
        this.scheduleAppointmentUseCase = scheduleAppointmentUseCase;
        this.listAppointmentsUseCase = listAppointmentsUseCase;
        this.cancelAppointmentUseCase = cancelAppointmentUseCase;
    }

    @PostMapping
    public ResponseEntity<AppointmentDto> schedule(@RequestBody ScheduleAppointmentCommand command) {
        var result = scheduleAppointmentUseCase.schedule(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public List<AppointmentDto> list(@RequestParam(required = false) Long patientId) {
        if (patientId != null) {
            return listAppointmentsUseCase.listByPatient(patientId);
        }
        return listAppointmentsUseCase.listAll();
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        cancelAppointmentUseCase.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
