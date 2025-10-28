# 📋 Job Scheduler Documentation

## 🎯 Tổng quan
Tính năng **Job Scheduler** tự động quản lý vòng đời của các Job trong hệ thống, bao gồm việc tự động deactivate các job hết hạn và theo dõi thống kê.

## 🏗️ Kiến trúc và Thành phần

### 1. **Core Components**

#### 📁 **JobSchedulerService**
- **Vị trí**: `com.example.jobhunter.service.JobSchedulerService`
- **Chức năng**: Xử lý các scheduled tasks
- **Annotations**: `@Service`, `@Transactional`

#### 📁 **JobSchedulerController** 
- **Vị trí**: `com.example.jobhunter.controller.JobSchedulerController`
- **Chức năng**: API endpoints cho admin quản lý scheduler
- **Security**: Chỉ ADMIN mới truy cập được

#### 📁 **StatusEnum** (Updated)
- **Vị trí**: `com.example.jobhunter.util.constant.StatusEnum`
- **Thêm**: `ACTIVE`, `INACTIVE` statuses

### 2. **Database Schema Changes**

#### 📊 **Job Entity Updates**
```java
// Thêm field mới
@Enumerated(EnumType.STRING)
private StatusEnum status; // ACTIVE, INACTIVE, PENDING, etc.
```

#### 📊 **Repository Methods**
```java
// Tìm jobs hết hạn
@Query("SELECT j FROM Job j WHERE j.isActive = true AND j.endDate < :currentDate")
List<Job> findActiveJobsWithEndDateBefore(@Param("currentDate") Date currentDate);

// Thống kê theo status
List<Job> findByIsActiveAndStatus(boolean isActive, StatusEnum status);
```

## ⚡ Cách hoạt động

### 1. **Automated Job Expiration**

#### 🕒 **Scheduled Task** 
```java
@Scheduled(cron = "0 0 0 * * ?") // Chạy hàng ngày lúc 00:00
public void deactivateExpiredJobs()
```

**Luồng xử lý:**
1. **Lấy ngày hiện tại** và convert sang Date
2. **Query database** tìm jobs có `isActive = true` và `endDate < currentDate`
3. **Deactivate jobs** bằng cách set:
   - `isActive = false`
   - `status = StatusEnum.INACTIVE`
4. **Log thông tin** về số lượng jobs đã deactivate
5. **Error handling** nếu có exception

#### 📊 **Statistics Logging**
```java
@Scheduled(fixedRate = 3600000) // Chạy mỗi giờ
public void logJobStatistics()
```

**Thống kê:**
- Tổng số jobs
- Số jobs đang active
- Số jobs đã inactive

### 2. **Manual Trigger**

#### 🎮 **Admin API**
```http
POST /api/v1/admin/job-scheduler/deactivate-expired
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "message": "Successfully deactivated expired jobs",
  "deactivatedCount": 5,
  "timestamp": 1703123456789
}
```

## 🔧 Configuration

### 1. **Application Properties**
```properties
# Enable scheduling
spring.task.scheduling.enabled=true
spring.task.scheduling.pool.size=2

# Cron expression for job expiration check
jobhunter.scheduler.job-expiration-cron=0 0 0 * * ?

# Statistics interval (milliseconds)
jobhunter.scheduler.statistics-interval=3600000

# Logging level
logging.level.com.example.jobhunter.service.JobSchedulerService=INFO
```

### 2. **Main Application**
```java
@SpringBootApplication
@EnableScheduling  // ✅ Thêm annotation này
public class JobhunterApplication
```

## 🧪 Testing Strategy

### 1. **Unit Tests**
- **JobSchedulerServiceTest**: Test logic deactivation
- **JobSchedulerControllerTest**: Test API endpoints

### 2. **Test Scenarios**
- ✅ Deactivate expired jobs successfully
- ✅ Handle no expired jobs
- ✅ Manual trigger functionality
- ✅ Statistics logging
- ✅ Error handling
- ✅ Security (ADMIN only)

### 3. **Integration Tests**
```java
@SpringBootTest
@Transactional
class JobSchedulerIntegrationTest
```

## 📊 Monitoring và Logging

### 1. **Log Levels**
```
INFO  - Normal operations (job deactivation, statistics)
ERROR - Exceptions and failures
DEBUG - Detailed execution flow
```

### 2. **Sample Log Output**
```
2024-01-01 00:00:00 INFO  JobSchedulerService - Starting scheduled task to deactivate expired jobs...
2024-01-01 00:00:01 INFO  JobSchedulerService - Found 3 expired jobs to deactivate
2024-01-01 00:00:01 INFO  JobSchedulerService - Deactivated job: ID=123, Name='Senior Developer', EndDate='2023-12-31'
2024-01-01 00:00:01 INFO  JobSchedulerService - Successfully deactivated 3 expired jobs
```

## 🔄 Job Lifecycle

### **Job States Flow**
```
CREATE -> ACTIVE (isActive=true, status=ACTIVE)
    ↓
EXPIRED -> INACTIVE (isActive=false, status=INACTIVE)
    ↓
MANUAL_UPDATE -> ACTIVE/INACTIVE (based on user action)
```

### **Status Mapping**
| **isActive** | **status** | **Description** |
|-------------|-----------|----------------|
| `true`      | `ACTIVE`  | Job đang hoạt động |
| `false`     | `INACTIVE`| Job đã hết hạn/bị tắt |
| `true`      | `PENDING` | Job chờ duyệt |
| `false`     | `REJECTED`| Job bị từ chối |

## 🚀 Production Deployment

### 1. **Performance Considerations**
- **Batch Processing**: Xử lý từng batch nếu có nhiều jobs
- **Index Database**: Đảm bảo index trên `endDate`, `isActive`
- **Memory Usage**: Monitor heap usage khi xử lý large datasets

### 2. **Monitoring Checklist**
- [ ] Scheduled tasks đang chạy đúng giờ
- [ ] Database performance ổn định
- [ ] Log files không bị đầy
- [ ] Error rate thấp

### 3. **Backup Strategy**
- **Before Deactivation**: Log hoặc backup jobs sắp bị deactivate
- **Rollback Plan**: Có thể reactivate jobs nếu cần

## 🔧 Troubleshooting

### **Common Issues**

1. **Scheduled task không chạy**
   ```bash
   # Check logs
   grep "JobSchedulerService" application.log
   
   # Verify configuration
   spring.task.scheduling.enabled=true
   ```

2. **Database performance chậm**
   ```sql
   -- Add indexes
   CREATE INDEX idx_job_active_enddate ON jobs(is_active, end_date);
   ```

3. **Memory leak**
   ```java
   // Monitor với JVM flags
   -XX:+HeapDumpOnOutOfMemoryError
   -XX:HeapDumpPath=/tmp/heapdump.hprof
   ```

## 📈 Future Enhancements

1. **Job Notification**: Email/SMS thông báo job sắp hết hạn
2. **Batch Processing**: Xử lý theo batch để tối ưu performance
3. **Dashboard**: Admin dashboard để monitor scheduler
4. **Flexible Scheduling**: Cho phép config cron expression động
5. **Job History**: Lưu lịch sử deactivation để audit

---

**📝 Version**: 1.0  
**👨‍💻 Author**: JobHunter Team  
**📅 Last Updated**: January 2024  
**🔗 Related**: Job Management System