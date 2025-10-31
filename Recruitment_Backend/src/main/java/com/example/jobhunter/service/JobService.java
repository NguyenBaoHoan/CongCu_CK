package com.example.jobhunter.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.jobhunter.domain.Job;
import com.example.jobhunter.dto.response.ResultPaginationDTO;
import com.example.jobhunter.dto.response.job.ResCreateJobDTO;
import com.example.jobhunter.dto.response.job.ResUpdateJobDTO;
import com.example.jobhunter.repository.JobRepository;
import com.example.jobhunter.util.constant.StatusEnum;

@Service
@Transactional
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public ResultPaginationDTO fetchAllJob(Specification<Job> spec, Pageable pageable) {
        Page<Job> jobPage = jobRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(jobPage.getNumber() + 1);
        mt.setPageSize(jobPage.getSize());
        mt.setPages(jobPage.getTotalPages());
        mt.setTotal(jobPage.getTotalElements());
        rs.setMeta(mt);
        rs.setResult(jobPage.getContent());
        return rs;
    }

    public ResCreateJobDTO handleSaveJob(Job job) {
        Job curJob = jobRepository.save(job);
        return convertToResCreateJobDTO(curJob);
    }

    public ResUpdateJobDTO handleUpdateJob(Long id, Job job) {
        Optional<Job> curJobOpt = fetchOneJob(id);
        if (!curJobOpt.isPresent()) {
            return null;
        }

        Job curJob = curJobOpt.get();
        curJob.setName(job.getName());
        curJob.setLocation(job.getLocation());
        curJob.setSalary(job.getSalary());
        curJob.setJobType(job.getJobType());
        curJob.setEducationLevel(job.getEducationLevel());
        curJob.setDescription(job.getDescription());
        curJob.setRequirements(job.getRequirements());
        curJob.setBenefits(job.getBenefits());
        curJob.setWorkAddress(job.getWorkAddress());
        curJob.setStartDate(job.getStartDate());
        curJob.setEndDate(job.getEndDate());
        curJob.setActive(job.isActive());
        
        if (job.isActive()) {
            curJob.setStatus(StatusEnum.ACTIVE);
        } else {
            curJob.setStatus(StatusEnum.INACTIVE);
        }

        Job updatedJob = jobRepository.save(curJob);
        return convertToResUpdateJobDTO(updatedJob);
    }

    public Optional<Job> fetchOneJob(Long id) {
        return jobRepository.findById(id);
    }

    public void handleDeleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    private ResCreateJobDTO convertToResCreateJobDTO(Job job) {
        ResCreateJobDTO rs = new ResCreateJobDTO();
        rs.setId(job.getId());
        rs.setName(job.getName());
        rs.setLocation(job.getLocation());
        rs.setSalary(job.getSalary());
        rs.setEducationLevel(job.getEducationLevel());
        rs.setJobType(job.getJobType());
        rs.setDescription(job.getDescription());
        rs.setRequirements(job.getRequirements());
        rs.setBenefits(job.getBenefits());
        rs.setWorkAddress(job.getWorkAddress());
        rs.setStartDate(job.getStartDate());
        rs.setEndDate(job.getEndDate());
        rs.setActive(job.isActive());
        rs.setCreatedAt(job.getCreatedAt());
        rs.setCreatedBy(job.getCreatedBy());
    
        return rs;
    }

    private ResUpdateJobDTO convertToResUpdateJobDTO(Job job) {
        ResUpdateJobDTO rs = new ResUpdateJobDTO();
        rs.setId(job.getId());
        rs.setName(job.getName());
        rs.setLocation(job.getLocation());
        rs.setSalary(job.getSalary());
        rs.setEducationLevel(job.getEducationLevel());
        rs.setJobType(job.getJobType());
        rs.setDescription(job.getDescription());
        rs.setStartDate(new java.sql.Date(job.getStartDate().getTime()));
        rs.setEndDate(new java.sql.Date(job.getEndDate().getTime()));
        rs.setActive(job.isActive());
        rs.setCreatedAt(job.getCreatedAt());
        rs.setCreatedBy(job.getCreatedBy());

        return rs;
    }
}
