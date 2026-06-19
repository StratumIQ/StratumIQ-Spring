# LOGGING_HARDENING_REPORT.md

**Status: ✅ MOSTLY PASS | ⚠️  REQUIRES HARDENING**

## 1. Current Logging Configuration

### Backend Configuration

**File:** `backend/src/main/resources/application.properties`

```properties
spring.jpa.show-sql=false
# (No other logging configuration found)
```

**Default Spring Boot Logging:**
- Level: INFO
- Output: Console (STDOUT)
- Format: Pattern-based

**Status:** ✅ **BASIC BUT NOT HARDENED**

---

## 2. Critical Issues

### Issue #1: No Production Logging Configuration

**Problem:**
- Spring Boot uses default logging configuration
- No separate production profile
- Debug information may leak in error messages
- PII (email, phone, JWT, passwords) not masked

**Severity:** 🟡 **MEDIUM**

### Issue #2: Structured Logging Not Implemented

**Problem:**
- Logs are unstructured plain text
- Difficult to parse, search, and monitor
- Cloud logging systems expect JSON format

**Severity:** 🟡 **MEDIUM**

### Issue #3: PII Not Masked in Logs

**Problem:**
- Email addresses logged in authentication events
- Phone numbers logged in OTP verification
- JWT tokens may appear in error messages
- Passwords never logged, but hashes may appear

**Severity:** 🔴 **CRITICAL**

---

## 3. Recommended Logging Architecture

### 3.1 Structured Logging with Logback

**Add to pom.xml:**

```xml
<!-- Structured logging with JSON -->
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-core</artifactId>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
    <scope>runtime</scope>
</dependency>

<!-- Async logging for performance -->
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>4.0.0</version>
    <optional>true</optional>
</dependency>
```

### 3.2 Logback Configuration

**Create:** `backend/src/main/resources/logback-spring.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-${LOG_TEMP:-${java.io.tmpdir:-/tmp}}/}spring.log}"/>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <!-- Development Profile: Console output -->
    <springProfile name="development">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
        <logger name="com.stratumiq" level="DEBUG"/>
        <logger name="org.springframework.security" level="DEBUG"/>
    </springProfile>

    <!-- Production Profile: JSON logging to files -->
    <springProfile name="production">
        <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
            <queueSize>512</queueSize>
            <discardingThreshold>0</discardingThreshold>
            <appender-ref ref="JSON_FILE"/>
        </appender>

        <appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>${LOG_FILE}</file>
            <encoder class="net.logstash.logback.encoder.LogstashEncoder">
                <timestampPattern>yyyy-MM-dd'T'HH:mm:ss.SSSZ</timestampPattern>
                <fieldNames>
                    <timestamp>@timestamp</timestamp>
                    <version>@version</version>
                    <message>message</message>
                    <logger>logger_name</logger>
                    <thread>thread_name</thread>
                    <level>log_level</level>
                    <levelValue>log_level_value</levelValue>
                </fieldNames>
                <customFields>{"app_name":"stratumiq","environment":"production"}</customFields>
            </encoder>
            
            <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
                <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
                <maxFileSize>100MB</maxFileSize>
                <maxHistory>30</maxHistory>
                <totalSizeCap>3GB</totalSizeCap>
            </rollingPolicy>
        </appender>

        <root level="INFO">
            <appender-ref ref="ASYNC_FILE"/>
        </root>

        <!-- Package-specific log levels -->
        <logger name="com.stratumiq" level="INFO"/>
        <logger name="org.springframework.security" level="WARN"/>
        <logger name="org.springframework.web" level="INFO"/>
        <logger name="org.hibernate" level="WARN"/>
    </springProfile>

    <!-- Appender: Console (development) -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
</configuration>
```

---

## 4. PII Masking Implementation

### 4.1 Masking Filter

**Create:** `backend/src/main/java/com/stratumiq/backend/security/LogMaskingFilter.java`

```java
package com.stratumiq.backend.security;

import ch.qos.logback.classic.spi.LoggingEvent;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;
import java.util.regex.Pattern;

public class LogMaskingFilter extends Filter<LoggingEvent> {
    
    // Patterns for sensitive data
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
    
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("\\b\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b");
    
    private static final Pattern JWT_PATTERN = 
        Pattern.compile("Bearer\\s+([A-Za-z0-9-._~+/]+=*)");
    
    private static final Pattern PASSWORD_PATTERN = 
        Pattern.compile("(password|passwd|pwd)\\s*=\\s*([^\\s,}]+)", Pattern.CASE_INSENSITIVE);
    
    private static final Pattern OTP_PATTERN = 
        Pattern.compile("(otp|code|token)\\s*=\\s*([0-9]{4,6})", Pattern.CASE_INSENSITIVE);
    
    @Override
    public FilterReply decide(LoggingEvent event) {
        String message = event.getFormattedMessage();
        
        if (message == null) {
            return FilterReply.NEUTRAL;
        }
        
        // Mask sensitive data
        String masked = message
            .replaceAll(EMAIL_PATTERN.pattern(), "***@***.***")
            .replaceAll(PHONE_PATTERN.pattern(), "***-***-****")
            .replaceAll(JWT_PATTERN.pattern(), "Bearer ***")
            .replaceAll(PASSWORD_PATTERN.pattern(), "$1=***")
            .replaceAll(OTP_PATTERN.pattern(), "$1=****");
        
        // If masking occurred, update the event
        if (!masked.equals(message)) {
            event.setMessage(masked);
            event.setArgumentArray(new Object[0]);
        }
        
        return FilterReply.NEUTRAL;
    }
}
```

### 4.2 Add Filter to Logback Configuration

```xml
<appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <filter class="com.stratumiq.backend.security.LogMaskingFilter"/>
    <!-- ... rest of appender config ... -->
</appender>
```

---

## 5. Security-Focused Logging

### 5.1 Create Security Logger

**Create:** `backend/src/main/java/com/stratumiq/backend/security/SecurityLogger.java`

```java
package com.stratumiq.backend.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SecurityLogger {
    
    // Authentication Events
    public void logLoginAttempt(String email, boolean success) {
        if (success) {
            log.info("Authentication successful - email: {}", maskEmail(email));
        } else {
            log.warn("Authentication failed - email: {}", maskEmail(email));
        }
    }
    
    public void logAccountLocked(String email, String reason) {
        log.warn("Account locked - email: {}, reason: {}", maskEmail(email), reason);
    }
    
    public void logTokenGenerated(String userId) {
        log.info("Token generated - user_id: {}", userId);
    }
    
    public void logTokenRefreshed(String userId) {
        log.info("Token refreshed - user_id: {}", userId);
    }
    
    public void logLogout(String userId) {
        log.info("User logged out - user_id: {}", userId);
    }
    
    // Suspicious Activity
    public void logUnauthorizedAccess(String endpoint, String userId) {
        log.warn("Unauthorized access attempt - endpoint: {}, user_id: {}", endpoint, userId);
    }
    
    public void logSuspiciousPattern(String pattern, String detail) {
        log.warn("Suspicious activity detected - pattern: {}, detail: {}", pattern, detail);
    }
    
    // Admin Actions
    public void logAdminAction(String action, String admin, String target) {
        log.info("Admin action - action: {}, admin: {}, target: {}", 
            action, maskEmail(admin), maskEmail(target));
    }
    
    private String maskEmail(String email) {
        if (email == null || email.length() < 4) return "***";
        String[] parts = email.split("@");
        if (parts.length != 2) return "***";
        return parts[0].charAt(0) + "***@" + parts[1];
    }
}
```

### 5.2 Use in AuthService

```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final SecurityLogger securityLogger;
    
    public Map<String, String> login(LoginRequest req) {
        try {
            // ... validation logic ...
            securityLogger.logLoginAttempt(req.email(), true);
            return issueTokens(user);
        } catch (Exception e) {
            securityLogger.logLoginAttempt(req.email(), false);
            throw e;
        }
    }
    
    public void logout(String userId) {
        // ... logout logic ...
        securityLogger.logLogout(userId);
    }
}
```

---

## 6. Logging Configuration by Environment

### 6.1 Development Logging

**File:** `backend/src/main/resources/application-development.properties`

```properties
# Development: Verbose logging
logging.level.root=INFO
logging.level.com.stratumiq=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Show SQL executed
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true
```

### 6.2 Production Logging

**File:** `backend/src/main/resources/application-production.properties`

```properties
# Production: Structured, minimal logging
logging.level.root=INFO
logging.level.com.stratumiq=INFO
logging.level.org.springframework.security=WARN
logging.level.org.springframework.web=WARN
logging.level.org.hibernate=WARN

# Never show SQL in production
spring.jpa.show-sql=false

# File-based logging
logging.file.name=/var/log/stratumiq/application.log
logging.file.max-size=100MB
logging.file.max-history=30
```

---

## 7. Logging Best Practices

### 7.1 What TO Log

```java
// ✅ GOOD
log.info("User logged in successfully - user_id: {}", userId);
log.warn("Failed login attempt for email: {}", maskEmail(email));
log.error("Database connection failed - error: {}", exception.getMessage());
log.info("File uploaded - file_name: {}, size: {} bytes", fileName, fileSize);
```

### 7.2 What NOT TO Log

```java
// ❌ BAD - Logs PII
log.info("Login successful for: " + user.getEmail());

// ❌ BAD - Logs password
log.debug("User password: " + password);

// ❌ BAD - Logs JWT token
log.info("Generated token: " + token);

// ❌ BAD - Logs full request body
log.debug("Request: " + request);

// ❌ BAD - Logs stack traces in production
log.error("Exception occurred", exception);  // May expose internals
```

### 7.3 Correct Logging

```java
// ✅ GOOD - Masked email
log.warn("Login failed for: {}", maskEmail(email));

// ✅ GOOD - No password logged (ever)
log.info("Password validation successful");

// ✅ GOOD - Token ID, not full token
log.info("Token generated - token_id: {}", tokenJti);

// ✅ GOOD - Request path only
log.info("POST {} - status: {}", request.getPath(), response.getStatus());

// ✅ GOOD - Exception message without stack trace
log.error("Login failed - reason: {}", exception.getMessage());
```

---

## 8. Log Aggregation Strategy

### 8.1 ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# Docker Compose for log aggregation
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
    ports:
      - "9200:9200"
  
  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
```

### 8.2 AWS CloudWatch

```java
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-aws-logging</artifactId>
    <version>2.2.1.RELEASE</version>
</dependency>
```

### 8.3 Google Cloud Logging

```java
<dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-logging-logback</artifactId>
    <version>0.126.0</version>
</dependency>
```

---

## 9. Log Monitoring & Alerting

### 9.1 Splunk Query Examples

```
# Failed login attempts
index=stratumiq log_level=WARN message="Authentication failed" 
| stats count by email_masked

# Account lockouts
index=stratumiq log_level=WARN message="Account locked"
| timechart count

# Unauthorized access attempts
index=stratumiq log_level=WARN message="Unauthorized access"
| stats count by endpoint, user_id
```

### 9.2 Alerts

```bash
# Alert on multiple failed logins
index=stratumiq message="Authentication failed" 
| stats count by email_masked 
| where count > 5

# Alert on high error rate
index=stratumiq log_level=ERROR 
| timechart count 
| where count > 100

# Alert on suspicious patterns
index=stratumiq message="Unauthorized access"
| stats count by user_id, endpoint
| where count > 10
```

---

## 10. Checklist for Production

```bash
# ✅ Logging Configuration
[ ] logback-spring.xml created and configured
[ ] JSON logging enabled for production
[ ] Async logging configured (Disruptor)
[ ] Log levels appropriate for production (INFO minimum)
[ ] DEBUG logging disabled for sensitive packages

# ✅ PII Masking
[ ] Email addresses masked in logs
[ ] Phone numbers masked in logs
[ ] JWT tokens not logged (only token_id)
[ ] Passwords never logged
[ ] OTP codes not logged
[ ] LogMaskingFilter implemented

# ✅ Security Logging
[ ] Failed login attempts logged
[ ] Account lockouts logged
[ ] Unauthorized access logged
[ ] Admin actions logged
[ ] Token generation/refresh logged

# ✅ Log Rotation
[ ] Max file size: 100MB
[ ] Max history: 30 days
[ ] Total size cap: 3GB
[ ] Compression enabled

# ✅ Log Storage
[ ] Logs stored in /var/log/stratumiq/
[ ] Persistent volume configured (Kubernetes)
[ ] Log aggregation setup (ELK, Splunk, etc.)
[ ] Backup strategy for logs

# ✅ Monitoring
[ ] Alerts configured for errors > threshold
[ ] Failed login attempts monitored
[ ] Access pattern monitoring active
```

---

## Summary

✅ **LOGGING HARDENING: RECOMMENDATIONS PROVIDED**

### Current State
- Spring Boot default logging (basic)
- No structured logging
- No PII masking
- No production-specific configuration

### After Implementation
- ✅ Structured JSON logging
- ✅ PII masking for emails, phones, tokens
- ✅ Async logging for performance
- ✅ Separate dev/prod configurations
- ✅ Security event logging
- ✅ Log aggregation ready

### Next Steps
1. Add logback-spring.xml to project
2. Add LogMaskingFilter to codebase
3. Create SecurityLogger component
4. Add environment-specific properties
5. Test logging with masking
6. Deploy log aggregation (ELK/CloudWatch)
