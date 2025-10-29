package com.example.jobhunter.domain;

import java.time.Instant;
import java.util.Date;

import com.example.jobhunter.util.constant.LevelEnum;
import com.example.jobhunter.util.constant.StatusEnum;
import com.example.jobhunter.util.error.SecurityUtil;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Table(name = "jobs")
@Entity
@Data
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String name;
    private String location;
    private String salary;

    @Enumerated(EnumType.STRING)
    private LevelEnum educationLevel;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String jobType;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String description;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String requirements;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String benefits;

    private String workAddress;
    private Date startDate;
    private Date endDate;
    private boolean isActive;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private String jobStatus;

    @PrePersist
    public void handleCreateAt() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleUpdateAt() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.updatedAt = Instant.now();
    }
}
