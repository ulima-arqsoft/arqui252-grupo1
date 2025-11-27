package com.example.clinic.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.clinic.adapters.out.persistence.AppointmentRepositoryAdapter;
import com.example.clinic.adapters.out.persistence.PatientRepositoryAdapter;
import com.example.clinic.adapters.out.persistence.SpringDataAppointmentRepository;
import com.example.clinic.adapters.out.persistence.SpringDataPatientRepository;
import com.example.clinic.application.port.in.CancelAppointmentUseCase;
import com.example.clinic.application.port.in.ListAppointmentsUseCase;
import com.example.clinic.application.port.in.RegisterPatientUseCase;
import com.example.clinic.application.port.in.ScheduleAppointmentUseCase;
import com.example.clinic.application.service.CancelAppointmentService;
import com.example.clinic.application.service.ListAppointmentsService;
import com.example.clinic.application.service.RegisterPatientService;
import com.example.clinic.application.service.ScheduleAppointmentService;
import com.example.clinic.domain.port.out.AppointmentRepositoryPort;
import com.example.clinic.domain.port.out.PatientRepositoryPort;

@Configuration
public class BeanConfig {

    // Puertos de salida
    @Bean
    PatientRepositoryPort patientRepositoryPort(SpringDataPatientRepository springDataPatientRepository) {
        return new PatientRepositoryAdapter(springDataPatientRepository);
    }

    @Bean
    AppointmentRepositoryPort appointmentRepositoryPort(SpringDataAppointmentRepository springDataAppointmentRepository) {
        return new AppointmentRepositoryAdapter(springDataAppointmentRepository);
    }

    // Use cases
    @Bean
    RegisterPatientUseCase registerPatientUseCase(PatientRepositoryPort patientRepositoryPort) {
        return new RegisterPatientService(patientRepositoryPort);
    }

    @Bean
    ScheduleAppointmentUseCase scheduleAppointmentUseCase(AppointmentRepositoryPort appointmentRepositoryPort,
                                                          PatientRepositoryPort patientRepositoryPort) {
        return new ScheduleAppointmentService(appointmentRepositoryPort, patientRepositoryPort);
    }

    @Bean
    ListAppointmentsUseCase listAppointmentsUseCase(AppointmentRepositoryPort appointmentRepositoryPort) {
        return new ListAppointmentsService(appointmentRepositoryPort);
    }

    @Bean
    CancelAppointmentUseCase cancelAppointmentUseCase(AppointmentRepositoryPort appointmentRepositoryPort) {
        return new CancelAppointmentService(appointmentRepositoryPort);
    }
}
