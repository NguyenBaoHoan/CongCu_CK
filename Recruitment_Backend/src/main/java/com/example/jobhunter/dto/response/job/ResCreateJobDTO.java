package com.example.jobhunter.dto.response.job;

import java.time.Instant;
import java.util.Date;

import com.example.jobhunter.util.constant.LevelEnum;

import lombok.Data;


@Data
public class ResCreateJobDTO {
    private long id;
    private String name;
    private String location;
    private String salary;
    private LevelEnum educationLevel;
    private String jobType;
    private String description;
    private String requirements;
    private String benefits;
    private String workAddress;
    private String companyName;
    private String companyLogoAsset;
    private Date startDate;
    private Date endDate;
    private boolean active;

    private Instant createdAt;
    private String createdBy;
}
