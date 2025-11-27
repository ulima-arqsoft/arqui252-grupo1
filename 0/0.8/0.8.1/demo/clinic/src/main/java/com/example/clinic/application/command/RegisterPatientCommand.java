package com.example.clinic.application.command;

import lombok.Data;

@Data
public class RegisterPatientCommand {
    private String documentNumber;
    private String fullName;
    private String email;
    private String phone;
}
