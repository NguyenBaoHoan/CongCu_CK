package com.example.jobhunter.dto.response;

import com.example.jobhunter.util.constant.GenderEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResCreateUserDTO {
    private long id;
    private String name;
    private String email;
    private String passWord;
    private int age;
    private GenderEnum gender;
}
