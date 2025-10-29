package com.example.jobhunter.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.jobhunter.domain.Job;
import com.example.jobhunter.util.constant.StatusEnum;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job>{

    /**
     * Tìm tất cả jobs đang active và có endDate trước ngày được chỉ định
     * Dùng để tìm các jobs hết hạn cần được deactivate
     */
    @Query("SELECT j FROM Job j WHERE j.isActive = true AND j.endDate < :currentDate")
    List<Job> findActiveJobsWithEndDateBefore(@Param("currentDate") Date currentDate);

    /**
     * Tìm jobs theo trạng thái isActive và status
     */
    List<Job> findByIsActiveAndStatus(boolean isActive, StatusEnum status);

    /**
     * Tìm jobs có endDate trong khoảng thời gian
     */
    @Query("SELECT j FROM Job j WHERE j.endDate BETWEEN :startDate AND :endDate")
    List<Job> findJobsWithEndDateBetween(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    /**
     * Đếm số lượng jobs đang active
     */
    long countByIsActiveTrue();

    /**
     * Đếm số lượng jobs theo status
     */
    long countByStatus(StatusEnum status);

    /**
     * Tìm jobs sắp hết hạn (trong vòng N ngày)
     */
    @Query("SELECT j FROM Job j WHERE j.isActive = true AND j.endDate >= :currentDate AND j.endDate <= :futureDate")
    List<Job> findJobsExpiringWithinDays(@Param("currentDate") Date currentDate, @Param("futureDate") Date futureDate);
    List<Job> findByName(String name);
}
