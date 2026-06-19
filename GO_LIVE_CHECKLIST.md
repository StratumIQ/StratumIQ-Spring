# GO_LIVE_CHECKLIST.md

**Status: 🟢 COMPREHENSIVE CHECKLIST PROVIDED**

## Pre-Production Go-Live Checklist

### ✅ INFRASTRUCTURE SETUP

#### Compute & Networking
- [ ] Production server provisioned (EC2, App Service, GKE, etc.)
- [ ] HTTPS certificate installed and valid (not self-signed)
- [ ] SSL/TLS 1.2+ configured
- [ ] Domain name configured and DNS validated
- [ ] Load balancer configured (if multiple instances)
- [ ] Network firewall rules configured
- [ ] CDN configured for static assets (optional)
- [ ] DDoS protection enabled (optional but recommended)

#### Database
- [ ] PostgreSQL 14+ provisioned
- [ ] Database backup configured (daily minimum)
- [ ] Backup retention: minimum 30 days
- [ ] Backup encryption enabled
- [ ] Restore procedure tested and documented
- [ ] Database replication/HA configured (if required)
- [ ] Connection pooling configured (HikariCP settings optimal)
- [ ] Max connections: 20-50 (test and optimize)
- [ ] Slow query logs enabled and monitored

#### Caching & Session Storage
- [ ] Redis provisioned (production-grade)
- [ ] Redis persistence enabled (AOF or RDB)
- [ ] Redis backup configured
- [ ] Redis memory limits set appropriately
- [ ] Redis eviction policy: `allkeys-lru` or similar
- [ ] Redis password configured (strong, complex)
- [ ] Redis connection monitoring enabled

#### File Storage
- [ ] Cloud storage provider selected (AWS S3, Azure Blob, GCS)
- [ ] Storage bucket/container created
- [ ] Encryption at rest enabled
- [ ] Versioning enabled (disaster recovery)
- [ ] Lifecycle policies configured (retention, cleanup)
- [ ] Cross-region replication enabled (disaster recovery)
- [ ] Access logs enabled
- [ ] Public access blocked (bucket policy)

#### Monitoring & Logging
- [ ] Log aggregation configured (ELK, Splunk, CloudWatch, Datadog)
- [ ] Application performance monitoring (APM) configured
- [ ] Uptime monitoring configured
- [ ] Alert thresholds defined
- [ ] Alert notification channels set up (Slack, PagerDuty, etc.)
- [ ] Dashboard created for operations team

---

### ✅ APPLICATION DEPLOYMENT

#### Backend (Spring Boot)
- [ ] Production JAR built: `mvn clean package -DskipTests`
- [ ] JAR file size verified (< 150MB)
- [ ] No DevTools in JAR verified
- [ ] No test dependencies in JAR verified
- [ ] Application properties externalized to env vars
- [ ] Database migrations (Flyway) verified
- [ ] Spring profiles: `production` configured

#### Frontend (Next.js)
- [ ] Production build completed: `npm run build`
- [ ] .next/ directory optimized
- [ ] No source maps in production
- [ ] Static assets minified
- [ ] CSS/JS bundled and compressed
- [ ] Next.js cache configured

#### Container & Orchestration
- [ ] Docker image built and tested
- [ ] Image scanned for vulnerabilities (Trivy, Snyk)
- [ ] Image published to registry (ECR, ACR, GCR, DockerHub)
- [ ] Container startup verified
- [ ] Container health check configured
- [ ] Kubernetes manifests created (if applicable)
- [ ] Pod resource limits configured (CPU, memory)
- [ ] Replica count: minimum 2 (for HA)

---

### ✅ SECURITY HARDENING

#### Secrets Management
- [ ] All environment secrets stored in secure location
  - AWS Secrets Manager, or
  - Kubernetes Secrets, or
  - HashiCorp Vault, or
  - CI/CD secrets management
- [ ] No secrets hardcoded in code
- [ ] No secrets in environment files
- [ ] No secrets in Docker images
- [ ] Secret access logs enabled
- [ ] Secret rotation schedule established (90-day JWT, 180-day DB)

#### Authentication & Authorization
- [ ] JWT tokens configured with strong secrets (min 32 chars)
- [ ] Access token expiry: 15 minutes (reasonable balance)
- [ ] Refresh token expiry: 7 days
- [ ] Account lockout after 5 failed attempts: enabled
- [ ] Account lockout duration: 30 minutes
- [ ] Password requirements enforced (if applicable)
- [ ] BCrypt cost factor: 12 (verified in code)
- [ ] Multi-factor authentication available (optional)

#### API Security
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] HSTS header configured (max-age: 31536000)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Content-Security-Policy configured
- [ ] Referrer-Policy configured
- [ ] CORS properly configured (not wildcard)
- [ ] Rate limiting configured:
  - Anonymous endpoints: 100 req/minute
  - Authenticated endpoints: 1000 req/minute
- [ ] Input validation on all endpoints
- [ ] Output encoding/escaping enabled
- [ ] SQL injection protection verified (parameterized queries)
- [ ] XSS protection verified (input sanitization)

#### Network Security
- [ ] VPC/private network configured
- [ ] Security groups/network policies configured
- [ ] Only required ports exposed (80, 443)
- [ ] Database port NOT exposed publicly
- [ ] Redis port NOT exposed publicly
- [ ] Admin endpoints protected/restricted
- [ ] IP whitelisting for admin endpoints (optional)

#### Data Protection
- [ ] Database backups encrypted
- [ ] File uploads encrypted at rest
- [ ] File uploads encrypted in transit (HTTPS)
- [ ] Sensitive data masked in logs (PII, email, phone, JWT)
- [ ] PII not stored in cache
- [ ] Session data stored securely (Redis with encryption)

#### Compliance
- [ ] GDPR compliance verified (if EU users)
- [ ] CCPA compliance verified (if CA users)
- [ ] Data retention policies documented
- [ ] Data deletion procedures implemented
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Security policy documented

---

### ✅ CONFIGURATION

#### Environment Variables
- [ ] `SERVER_PORT` configured for production
- [ ] `DB_URL` points to production database
- [ ] `DB_USER` configured
- [ ] `DB_PASSWORD` strong and externalized
- [ ] `JWT_ACCESS_SECRET` strong (32+ chars)
- [ ] `JWT_REFRESH_SECRET` strong (32+ chars)
- [ ] `FRONTEND_URL` set to production domain
- [ ] `COOKIE_SECURE=true` (for HTTPS)
- [ ] `COOKIE_SAME_SITE=Strict`
- [ ] `UPLOAD_DIR` or cloud storage configured
- [ ] `SPRING_PROFILES_ACTIVE=production`
- [ ] `LOG_LEVEL=INFO` (not DEBUG)
- [ ] `REDIS_HOST` configured
- [ ] `REDIS_PASSWORD` strong and externalized
- [ ] Any other required env vars documented

#### Build Configuration
- [ ] Maven profiles configured correctly
- [ ] Spring Boot profiles: development, production
- [ ] Log levels appropriate per profile
- [ ] Database DDL mode: `validate` (never `create-drop`)
- [ ] SQL debugging disabled in production

#### Runtime Configuration
- [ ] JVM memory: -Xmx set appropriately (e.g., -Xmx1G)
- [ ] JVM garbage collection: G1GC configured
- [ ] JVM system properties optimized
- [ ] Timezone configured (UTC recommended)
- [ ] Locale configured

---

### ✅ TESTING

#### Functional Testing
- [ ] User registration flow tested end-to-end
- [ ] User login/logout tested
- [ ] Password reset tested
- [ ] Token refresh tested
- [ ] API endpoints tested with production data
- [ ] File upload tested (if applicable)
- [ ] File download tested (if applicable)
- [ ] Admin functions tested
- [ ] Concurrent user load tested

#### Security Testing
- [ ] JWT token tampering tested (should fail)
- [ ] Expired token rejection tested
- [ ] Account lockout after 5 failures tested
- [ ] SQL injection attempted (should fail)
- [ ] XSS attack attempted (should fail)
- [ ] CSRF protection verified
- [ ] Rate limiting tested
- [ ] CORS restrictions tested
- [ ] Unauthorized access blocked (403)

#### Performance Testing
- [ ] Load test: 100 concurrent users
- [ ] Load test: 1000 concurrent users
- [ ] Response time under load: < 500ms
- [ ] Error rate under load: < 1%
- [ ] Database connection pool tested
- [ ] Memory usage stable (no leaks)
- [ ] CPU usage reasonable

#### Disaster Recovery Testing
- [ ] Database backup restore tested
- [ ] Application recovery from failure tested
- [ ] Service restart procedure tested
- [ ] Failover procedure tested (if HA configured)

---

### ✅ DEPLOYMENT PROCESS

#### Pre-Deployment
- [ ] Deployment plan documented
- [ ] Rollback procedure documented and tested
- [ ] Deployment window scheduled
- [ ] Stakeholders notified
- [ ] On-call support arranged
- [ ] Smoke test plan prepared

#### Deployment Steps
- [ ] Production JAR built and tested locally
- [ ] Frontend build tested locally
- [ ] Docker images scanned for vulnerabilities
- [ ] Database migrations tested on staging
- [ ] Configuration validated on staging
- [ ] Smoke tests run on staging
- [ ] All team approvals obtained
- [ ] Backup of current system taken
- [ ] New version deployed to production
- [ ] Health checks verified
- [ ] Basic functionality tested
- [ ] Performance metrics verified

#### Post-Deployment
- [ ] Monitor application logs for errors
- [ ] Monitor database performance
- [ ] Monitor API response times
- [ ] Monitor error rates
- [ ] Verify users can login
- [ ] Verify critical workflows functioning
- [ ] Check for any alerts
- [ ] Performance baseline established
- [ ] Deployment documented in change log

---

### ✅ OPERATIONAL READINESS

#### Documentation
- [ ] Architecture diagram documented
- [ ] Deployment architecture documented
- [ ] API documentation (OpenAPI/Swagger) available
- [ ] Database schema documented
- [ ] Configuration options documented
- [ ] Troubleshooting guide created
- [ ] Runbook created for common issues
- [ ] Disaster recovery procedure documented
- [ ] Incident response plan documented

#### Training
- [ ] Operations team trained
- [ ] Support team trained on common issues
- [ ] Escalation procedures documented
- [ ] On-call rotation established
- [ ] Alert response procedures trained

#### Monitoring & Support
- [ ] 24/7 monitoring in place
- [ ] Alert notifications working
- [ ] Escalation paths established
- [ ] Support contact info shared
- [ ] SLA defined and communicated

---

### ✅ COMPLIANCE & COMPLIANCE

#### Legal & Compliance
- [ ] Privacy policy reviewed and published
- [ ] Terms of service reviewed and published
- [ ] Cookie policy published (GDPR compliance)
- [ ] Data processing agreement (if B2B)
- [ ] Incident response plan for data breaches
- [ ] Legal team sign-off obtained

#### Security Compliance
- [ ] Penetration test completed (optional but recommended)
- [ ] Vulnerability scan completed
- [ ] Security assessment completed
- [ ] Compliance checklist completed
- [ ] SOC2/ISO27001 requirements verified (if applicable)

---

### ✅ FINAL SIGN-OFF

#### Technical Review
- [ ] CTO/Tech Lead review: **[NAME] Date: [DATE]**
  - Reviewed checklist items?  ☐
  - Security concerns addressed?  ☐
  - Architecture sound?  ☐
  - Deployment procedure safe?  ☐
  - Approve for production? **[ ] YES  [ ] NO**

#### Operations Review
- [ ] Operations Lead review: **[NAME] Date: [DATE]**
  - Monitoring in place?  ☐
  - Runbooks prepared?  ☐
  - Team trained?  ☐
  - Escalation procedures clear?  ☐
  - Approve for production? **[ ] YES  [ ] NO**

#### Security Review
- [ ] Security Lead review: **[NAME] Date: [DATE]**
  - Secrets externalized?  ☐
  - Security headers present?  ☐
  - Rate limiting configured?  ☐
  - Input validation enforced?  ☐
  - Approve for production? **[ ] YES  [ ] NO**

#### Product/Business Review
- [ ] Product Manager review: **[NAME] Date: [DATE]**
  - Features working as expected?  ☐
  - Performance acceptable?  ☐
  - User experience smooth?  ☐
  - Approve for production? **[ ] YES  [ ] NO**

---

### ✅ CRITICAL VERIFICATION (Day Before Go-Live)

```bash
# 1. Verify all environment variables set
env | grep -E "JWT_|DB_|UPLOAD_|FRONTEND_|COOKIE_|REDIS_|SERVER_PORT"
# Should show all production values

# 2. Verify database connectivity
psql -U $DB_USER -h $(echo $DB_URL | grep -oP '(?<=://).*(?=:)') -d stratumiq -c "SELECT 1"
# Expected: 1 row

# 3. Verify Redis connectivity
redis-cli -h $REDIS_HOST PING
# Expected: PONG

# 4. Verify files are readable
ls -l backend/target/backend-*.jar
# Expected: File exists, readable

# 5. Verify configurations
cat backend/src/main/resources/application.properties | grep "^\${"
# Expected: All env var references

# 6. Test backend startup
java -jar backend/target/backend-*.jar &
sleep 10
curl -s http://localhost:8080/actuator/health | jq .status
# Expected: "UP"
kill %1

# 7. Verify frontend build
ls -d frontend/.next/
# Expected: directory exists
```

---

## Critical Success Factors

### DO NOT GO LIVE WITHOUT

1. ✅ **HTTPS Certificate Valid**
   - [ ] Certificate installed
   - [ ] Certificate valid for domain
   - [ ] Certificate not self-signed
   - [ ] Certificate not expired

2. ✅ **Database Backup**
   - [ ] Backup created
   - [ ] Backup tested (restore verified)
   - [ ] Backup location secure
   - [ ] Backup retention: 30+ days

3. ✅ **Secrets Externalized**
   - [ ] No hardcoded secrets in JAR
   - [ ] All secrets in env vars/secrets manager
   - [ ] Production secrets strong (32+ chars)
   - [ ] Secrets not in logs

4. ✅ **Health Checks Working**
   - [ ] `/actuator/health` responds UP
   - [ ] Database connectivity verified
   - [ ] Redis connectivity verified
   - [ ] File storage accessible

5. ✅ **Monitoring Active**
   - [ ] Logs aggregated and searchable
   - [ ] Alerts configured and tested
   - [ ] On-call support in place
   - [ ] Escalation paths clear

---

## Post-Go-Live Validation (First 24 Hours)

```bash
# Hour 1: Basic Health
[ ] Application responding to requests
[ ] Database queries executing
[ ] No spike in error logs
[ ] Monitoring alerts all green

# Hour 4: Load Testing
[ ] Simulate 50 concurrent users
[ ] Verify response times < 500ms
[ ] Check error rate < 1%
[ ] Verify database performance

# Hour 8: Functional Testing
[ ] Test user registration workflow
[ ] Test login/logout
[ ] Test file upload (if applicable)
[ ] Test API endpoints

# Hour 24: Final Assessment
[ ] No critical issues in logs
[ ] Performance metrics stable
[ ] All team notifications working
[ ] No security incidents
[ ] Go-Live: SUCCESS ✅
```

---

## Rollback Procedure (If Issues)

```bash
# 1. Immediate Actions (0-5 min)
- [ ] Stop traffic to new version
- [ ] Page on-call team
- [ ] Open incident channel

# 2. Assess (5-10 min)
- [ ] Review error logs
- [ ] Check database integrity
- [ ] Verify Redis state
- [ ] Determine rollback necessity

# 3. Rollback (10-20 min)
- [ ] Restore database from backup (if needed)
- [ ] Deploy previous version
- [ ] Verify application health
- [ ] Resume traffic

# 4. Post-Rollback (20+ min)
- [ ] Run smoke tests
- [ ] Verify user access restored
- [ ] Document incident
- [ ] Schedule post-mortem
```

---

## Summary

✅ **GO-LIVE CHECKLIST: COMPREHENSIVE**

This checklist covers:
- Infrastructure setup and verification
- Application deployment procedures
- Security hardening validation
- Testing protocols
- Operational readiness
- Sign-off procedures
- Post-deployment validation

**Before pressing the "Deploy" button, ensure:**
1. All ✅ items are checked
2. All critical items verified
3. All team sign-offs obtained
4. Backup and rollback procedures tested
5. On-call support confirmed

**Status: READY FOR GO-LIVE EXECUTION**
