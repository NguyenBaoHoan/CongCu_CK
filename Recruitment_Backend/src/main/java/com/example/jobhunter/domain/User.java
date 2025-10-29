package com.example.jobhunter.domain;

import com.example.jobhunter.util.constant.GenderEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @NotBlank(message = "you cann't leave blank")
    private String email;
    @NotBlank(message = "you cann't leave blank")
    private String passWord;

    private int age;
    private String role;
    @Enumerated(EnumType.STRING)
    private GenderEnum gender;

    private String address;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String refreshToken;
}
