package com.example.clinic.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Patient {

    private Long id;
    private String documentNumber;
    private String fullName;
    private String email;
    private String phone;
}
