# UPLOAD_SECURITY_REPORT.md

**Status: ✅ PARTIALLY SECURED | ⚠️  REQUIRES EXTERNALIZATION**

## 1. Current Upload Configuration

### Configuration

**File:** `backend/src/main/resources/application.properties`

```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
app.upload.dir=${UPLOAD_DIR:uploads}
```

**Status:** ✅ **CONFIGURED BUT NOT PRODUCTION-READY**

- Upload directory: `uploads/` (relative path, **PROBLEM**)
- Max file size: 5MB (reasonable)
- Max request size: 5MB (matches file size)
- Directory is env-var configurable (good for flexibility)

---

## 2. Critical Issues

### Issue #1: Local File System Storage

**Problem:** 
- Uploads stored in `uploads/` directory on local filesystem
- In containerized environments, this creates **ephemeral storage**
- Files are lost when container stops/restarts
- Multiple instances cannot share uploads
- No backup/disaster recovery

**Severity:** 🔴 **CRITICAL**

**Status in Git:** 
- Checked in `.gitignore` under `uploads/` ✅

---

### Issue #2: Production Deployment Risk

**Scenario 1: Docker Container**
```bash
# Files stored in container filesystem
docker run -v /data/uploads:/app/uploads stratumiq:prod
# ❌ If container crashes, all uploads are lost
# ❌ Rolling updates = complete data loss
```

**Scenario 2: Kubernetes Pod**
```yaml
# Without persistent volume
apiVersion: v1
kind: Pod
  spec:
    containers:
    - volumeMounts:
      - name: uploads
        mountPath: /app/uploads
    volumes:
    - name: uploads
      emptyDir: {}  # ❌ Lost on pod termination
```

**Scenario 3: Load Balanced Environment**
```
Client 1 → Pod A (uploads file)
Client 2 → Pod B (requests file) ❌ FILE NOT FOUND
# Uploads are pod-local, not shared
```

---

## 3. Production-Grade Upload Storage Recommendation

### Option 1: AWS S3 (Recommended)

**Benefits:**
- ✅ Infinite scalability
- ✅ 99.99% durability
- ✅ Built-in backup/versioning
- ✅ Cost-effective ($0.023 per GB)
- ✅ CDN integration (CloudFront)
- ✅ Encryption at rest & in transit
- ✅ Access control (IAM, bucket policies)

**Implementation:**

```java
// Add dependency to pom.xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.25.0</version>
</dependency>

// Configuration
app.storage.provider=aws-s3
app.aws.s3.bucket=${AWS_S3_BUCKET}
app.aws.s3.region=${AWS_REGION}
app.aws.s3.access-key=${AWS_ACCESS_KEY}
app.aws.s3.secret-key=${AWS_SECRET_KEY}
```

**Example S3 Buckets:**
- `stratumiq-prod-uploads` (production)
- `stratumiq-staging-uploads` (staging)
- `stratumiq-dev-uploads` (development)

---

### Option 2: Azure Blob Storage

**Benefits:**
- ✅ Enterprise-grade reliability
- ✅ Lifecycle management
- ✅ Encryption (service-managed or BYOK)
- ✅ Geo-redundant options
- ✅ Good integration with Azure infrastructure

**Implementation:**

```java
// Add dependency
<dependency>
    <groupId>com.azure</groupId>
    <artifactId>azure-storage-blob</artifactId>
    <version>12.25.0</version>
</dependency>

// Configuration
app.storage.provider=azure-blob
app.azure.storage.account=${AZURE_STORAGE_ACCOUNT}
app.azure.storage.key=${AZURE_STORAGE_KEY}
app.azure.storage.container=${AZURE_STORAGE_CONTAINER}
```

---

### Option 3: Google Cloud Storage

**Benefits:**
- ✅ Strong consistency
- ✅ Automatic redundancy
- ✅ Deep integration with GCP
- ✅ Advanced search capabilities

**Implementation:**

```java
// Add dependency
<dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-storage</artifactId>
    <version>2.36.1</version>
</dependency>

// Configuration
app.storage.provider=gcs
app.gcs.project-id=${GCP_PROJECT_ID}
app.gcs.bucket=${GCP_BUCKET}
app.gcs.credentials-path=${GOOGLE_APPLICATION_CREDENTIALS}
```

---

### Option 4: NFS/Network File System (For On-Premise)

**If cloud storage not available:**

```properties
app.upload.dir=/mnt/nfs/stratumiq-uploads
# Mounted from NFS server
# Supports multiple instances
```

**Kubernetes example:**
```yaml
volumes:
- name: uploads
  nfs:
    server: nfs.example.com
    path: "/stratumiq-uploads"
```

---

## 4. Immediate Hardening (Local Filesystem)

**For short-term production (NOT RECOMMENDED for long-term):**

### 4.1 Persistent Volume in Kubernetes

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: stratumiq-uploads
spec:
  accessModes:
    - ReadWriteMany  # Multiple pods can access
  storageClassName: ebs  # AWS EBS
  resources:
    requests:
      storage: 100Gi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stratumiq-backend
spec:
  replicas: 3
  template:
    spec:
      volumes:
      - name: uploads
        persistentVolumeClaim:
          claimName: stratumiq-uploads
      
      containers:
      - name: backend
        volumeMounts:
        - name: uploads
          mountPath: /data/uploads
        env:
        - name: UPLOAD_DIR
          value: /data/uploads
```

### 4.2 Docker Persistent Volume

```bash
# Create named volume
docker volume create stratumiq-uploads

# Run container with persistent volume
docker run -d \
  -v stratumiq-uploads:/data/uploads \
  -e UPLOAD_DIR=/data/uploads \
  stratumiq/backend:latest
```

---

## 5. Upload Security Controls Audit

| Control | Status | Details |
|---------|--------|---------|
| File size limits | ✅ YES | Max 5MB configured |
| Request size limits | ✅ YES | Max 5MB configured |
| File type validation | ⚠️  UNKNOWN | Requires code review |
| Virus scanning | ❌ NO | Should add for production |
| Encryption at rest | ❌ NO | Use cloud provider encryption |
| Encryption in transit | ⚠️  YES (if HTTPS) | Requires HTTPS verification |
| Access control | ⚠️  PARTIAL | Requires user scope verification |
| Rate limiting | ✅ YES | Bucket4j configured |
| Malware detection | ❌ NO | Consider ClamAV integration |

### 5.1 Recommended Additional Controls

```java
// 1. File type whitelist
private static final Set<String> ALLOWED_TYPES = Set.of(
    "image/jpeg", "image/png", "image/gif",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);

// 2. Scan with ClamAV
@Bean
public ClamAvClient clamAvClient() {
    return new ClamAvClient("clamav.example.com", 3310);
}

// 3. Quarantine suspicious uploads
private void quarantineFile(String uploadId, String reason) {
    moveToQuarantine(uploadId);
    logSecurityEvent("UPLOAD_QUARANTINED", reason);
}

// 4. File naming (prevent directory traversal)
private String sanitizeFilename(String filename) {
    return filename
        .replaceAll("[^a-zA-Z0-9._-]", "_")
        .replaceAll("\\.\\.+", ".");
}
```

---

## 6. Migration Plan: Local → Cloud Storage

### Phase 1: Add Cloud Storage Support (Week 1-2)

```java
// Create abstraction
public interface StorageService {
    String uploadFile(MultipartFile file) throws IOException;
    InputStream downloadFile(String fileId) throws IOException;
    void deleteFile(String fileId) throws IOException;
    URL getFileUrl(String fileId);
}

// Implementations
class S3StorageService implements StorageService { ... }
class AzureStorageService implements StorageService { ... }
class LocalStorageService implements StorageService { ... }
```

### Phase 2: Dual-Write Strategy (Week 2-3)

```java
// Write to both old and new storage
@Service
@RequiredArgsConstructor
public class HybridUploadService {
    private final StorageService primaryStorage;  // Cloud
    private final StorageService legacyStorage;   // Local
    
    public String uploadFile(MultipartFile file) {
        String cloudId = primaryStorage.uploadFile(file);
        String localId = legacyStorage.uploadFile(file);
        
        // Record mapping for migration tracking
        uploadMigrationService.recordMapping(localId, cloudId);
        
        return cloudId;  // Return cloud ID
    }
}
```

### Phase 3: Migration of Existing Files (Week 3-4)

```java
// Batch job to migrate historical uploads
@Scheduled(fixedRate = 300000)  // Every 5 minutes
public void migrateExistingUploads() {
    List<Upload> unmigrated = uploadRepo.findByMigratedFalse();
    
    for (Upload upload : unmigrated) {
        try {
            InputStream file = legacyStorage.downloadFile(upload.getId());
            String cloudId = primaryStorage.uploadFile(file);
            upload.setCloudStorageId(cloudId);
            upload.setMigrated(true);
            uploadRepo.save(upload);
        } catch (IOException e) {
            logger.error("Migration failed for upload: {}", upload.getId(), e);
        }
    }
}
```

### Phase 4: Deprecate Local Storage (Week 4-5)

- Set `UPLOAD_DIR` to read-only
- Monitor logs for any remaining local upload attempts
- Archive local uploads for backup
- Once verified complete: remove LocalStorageService

---

## 7. Production Checklist

### Before Go-Live

```bash
# Option A: Cloud Storage Selected
[ ] AWS S3 bucket created and configured
[ ] Access keys rotated and secured (use IAM roles if possible)
[ ] Lifecycle policies configured (30-day retention minimum)
[ ] Versioning enabled
[ ] Server-side encryption enabled (AES-256)
[ ] MFA delete protection enabled
[ ] Cross-region replication configured
[ ] Cloudfront CDN setup (if needed)

# Option B: Local Storage on Persistent Volume (Temporary)
[ ] PersistentVolume created with 100GB+ capacity
[ ] Storage class set to gp3/gp2 (AWS) or equivalent
[ ] Backup script configured (daily backups to S3)
[ ] Restore procedure documented and tested
[ ] Monitoring setup for disk usage
[ ] Alerts configured for 80%+ usage

# General
[ ] Upload endpoint rate-limited (Bucket4j)
[ ] File type validation implemented
[ ] File size limits enforced (5MB max)
[ ] Virus scanning operational
[ ] Access logs enabled and monitored
[ ] Test upload/download workflow end-to-end
```

---

## 8. Environment Variables for Cloud Storage

**Backend .env.example:**

```bash
# Storage Configuration
UPLOAD_STORAGE_PROVIDER=aws-s3              # aws-s3|azure-blob|gcs|local
UPLOAD_MAX_SIZE_MB=50                       # Increase from default 5MB

# AWS S3
AWS_S3_BUCKET=stratumiq-prod-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=stratumiq
AZURE_STORAGE_KEY=***
AZURE_STORAGE_CONTAINER=uploads

# GCS
GCP_PROJECT_ID=stratumiq-prod
GCP_BUCKET=stratumiq-uploads
GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcp-key.json

# Local (fallback only)
UPLOAD_DIR=/data/uploads
```

---

## Summary

🔴 **UPLOAD SECURITY: PARTIALLY SECURED - REQUIRES IMMEDIATE ATTENTION**

### Critical Issues
1. ❌ Files stored on ephemeral local filesystem
2. ❌ No persistence in containerized environments
3. ❌ Multiple instances cannot share uploads
4. ❌ No disaster recovery/backup strategy

### Immediate Actions (This Week)
- [ ] Evaluate cloud storage provider (recommend AWS S3)
- [ ] Create PoC upload service with selected provider
- [ ] Set up persistent volumes as interim solution
- [ ] Document migration plan

### Before Production Deployment
- [ ] Migrate to cloud storage (AWS S3, Azure Blob, or GCS)
- [ ] Enable encryption at rest
- [ ] Configure lifecycle policies (retention)
- [ ] Setup backup/restore procedures
- [ ] Enable access logging and monitoring
- [ ] Add virus scanning (ClamAV)

### Recommended Architecture

```
┌─────────────────┐
│ Client Upload   │
└────────┬────────┘
         │
┌────────▼─────────────────┐
│ Spring Boot Application   │
│ - Rate limiting           │
│ - File validation         │
│ - Virus scanning          │
└────────┬─────────────────┘
         │
    ┌────▼─────────────┐
    │ Storage Service  │
    │ Abstraction      │
    └────┬──────────┬──────────┬────────┐
         │          │          │        │
      ┌──▼──┐   ┌──▼─┐   ┌───▼──┐  ┌─▼────┐
      │ S3  │   │GCS │   │Azure │  │Local │
      │     │   │    │   │Blob  │  │(PV)  │
      └─────┘   └────┘   └──────┘  └──────┘
```

**Recommended Timeline:**
- Week 1: Cloud storage evaluation and setup
- Week 2: Dual-write implementation
- Week 3: Existing file migration
- Week 4: Migration verification
- Week 5: Deprecate local storage
