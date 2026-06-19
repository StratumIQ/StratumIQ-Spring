# DEPLOYMENT_EXCLUSIONS.md

**Status: ✅ POLICY DEFINED**

## 1. Files to EXCLUDE from Production Deployment

### Critical Exclusions (MUST DELETE)

| Path | Type | Reason | Action |
|------|------|--------|--------|
| `backend/uploads/` | Directory | Runtime file storage; never commit to Git | Delete before JAR build |
| `.github/` | Directory | CI/CD workflows (dev-only) | Delete before deployment |
| `docs/` | Directory | Development documentation | Archive separately; do NOT deploy |
| `site/` | Directory | MkDocs output (development) | Delete before deployment |
| `frontend/AGENTS.md` | File | Development agent configuration | Delete before deployment |
| `frontend/CLAUDE.md` | File | Development agent configuration | Delete before deployment |
| `FRONTEND_TOKEN_MIGRATION.md` | File | Migration notes (not user-facing) | Delete before deployment |
| `docs/postman/` | Directory | Postman collections with hardcoded credentials | Delete before deployment |
| `docs/API_ADMIN.md` | File | Contains hardcoded test credentials | Delete before deployment |

### Development Artifacts (MAY KEEP if needed for support)

| Path | Type | Reason | Action |
|------|------|--------|--------|
| `README.md` | File | Developer onboarding (may keep for ops team) | Optional - delete if not needed |
| `mkdocs.yml` | File | Documentation generator config | Delete before deployment |
| `mkdocs_nopdf.yml` | File | Documentation generator config | Delete before deployment |
| `requirements-docs.txt` | File | MkDocs dependencies | Delete before deployment |
| `backend/.env.example` | File | Template for configuration (no secrets) | ✅ KEEP - useful reference |
| `.vscode/` | Directory | IDE configuration | Delete before deployment |
| `frontend/docs/UX_REFACTOR_REPORT.md` | File | Development documentation | Archive; delete from deployment |

### Git-Related (ALREADY in .gitignore)

| Path | Reason |
|------|--------|
| `.git/` | Git repository history (never deployed) |
| `.gitignore` | Git configuration |
| `.github/` | GitHub Actions workflows |
| `.gitlab-ci.yml` | GitLab CI configuration |

---

## 2. Production Deployment Artifact Contents

### What SHOULD be deployed:

#### Backend JAR
```
backend-VERSION.jar
├── BOOT-INF/
│   ├── classes/
│   │   ├── application.properties (env var based)
│   │   ├── db/migration/ (Flyway scripts)
│   │   └── com/stratumiq/backend/... (compiled .class files)
│   ├── lib/ (all dependencies except devtools/test)
│   └── classpath.idx
├── META-INF/
│   ├── MANIFEST.MF
│   └── spring.components
└── org/springframework/boot/loader/...
```

**✅ Included:**
- Compiled Java classes
- Production dependencies (Spring, JWT, Redis, etc.)
- Flyway database migrations
- Configuration templates

**❌ NOT included:**
- Source code (.java files)
- Test classes
- Spring DevTools
- Documentation
- Postman collections

#### Frontend Output (.next/)
```
.next/
├── standalone/ (optimized for deployment)
├── static/ (CSS, JS, images)
├── server/ (Next.js server code)
├── cache/ (build cache)
└── public/ (static assets)
```

**✅ Included:**
- Compiled Next.js application
- Optimized production assets
- Static files (CSS, JS, images)

**❌ NOT included:**
- TypeScript source (.ts, .tsx)
- Development tools (ESLint, Tailwind)
- Node modules (use package.json for deps)

### Static Assets
```
public/
├── favicon.ico
├── images/
└── other-public-assets/

.env.example (for reference only, no actual secrets)
```

---

## 3. Pre-Deployment Cleanup Script

```bash
#!/bin/bash
# cleanup-for-deployment.sh
# Run this BEFORE packaging for production

set -e

WORKSPACE_ROOT="."

echo "🧹 Cleaning up development artifacts..."

# Remove directories
rm -rf "$WORKSPACE_ROOT/.github"
rm -rf "$WORKSPACE_ROOT/docs"
rm -rf "$WORKSPACE_ROOT/site"
rm -rf "$WORKSPACE_ROOT/.vscode"
rm -rf "$WORKSPACE_ROOT/backend/uploads"
rm -rf "$WORKSPACE_ROOT/frontend/node_modules" # Will be reinstalled

# Remove development files
rm -f "$WORKSPACE_ROOT/frontend/AGENTS.md"
rm -f "$WORKSPACE_ROOT/frontend/CLAUDE.md"
rm -f "$WORKSPACE_ROOT/FRONTEND_TOKEN_MIGRATION.md"
rm -f "$WORKSPACE_ROOT/docs/postman/StratumIQ-Admin.postman_collection.json"
rm -f "$WORKSPACE_ROOT/docs/API_ADMIN.md"
rm -f "$WORKSPACE_ROOT/mkdocs.yml"
rm -f "$WORKSPACE_ROOT/mkdocs_nopdf.yml"
rm -f "$WORKSPACE_ROOT/requirements-docs.txt"
rm -f "$WORKSPACE_ROOT/README.md" # Optional: remove if not needed for support

# Keep .env.example as reference
# Keep backend/.env.example as reference

echo "✅ Cleanup complete"
echo "📦 Ready for JAR/package build"
```

**Usage:**
```bash
chmod +x cleanup-for-deployment.sh
./cleanup-for-deployment.sh
mvn clean package -DskipTests
```

---

## 4. Docker Build Optimization

**Recommended Dockerfile:**

```dockerfile
# Stage 1: Build backend
FROM maven:3.9-eclipse-temurin-17 as backend-builder
WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

# Remove dev artifacts
RUN rm -rf .github docs site README.md mkdocs* requirements-docs.txt

# Build production JAR
RUN mvn clean package -DskipTests -Dspring.profiles.active=production

---

# Stage 2: Build frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app

COPY frontend/package*.json .
RUN npm ci --prefer-offline --no-audit

COPY frontend/ .
RUN npm run build

# Remove dev files
RUN rm -rf \
  node_modules \
  src \
  AGENTS.md \
  CLAUDE.md \
  .eslintrc* \
  tsconfig.json \
  *.md

---

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine

ENV SPRING_PROFILES_ACTIVE=production

# Copy backend JAR
COPY --from=backend-builder /app/target/backend-*.jar /app/backend.jar

# Copy frontend (if serving from Spring Boot)
# COPY --from=frontend-builder /app/.next /app/public/frontend

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

CMD ["java", "-jar", "/app/backend.jar"]
```

---

## 5. Git Repository Cleanup

**Before committing to production branch:**

```bash
# Verify exclusions are in .gitignore
git check-ignore -v backend/uploads/
git check-ignore -v docs/
git check-ignore -v .github/

# If files are already tracked, remove from Git history
git rm --cached -r backend/uploads/
git rm --cached -r docs/
git rm --cached -r .github/
git rm --cached frontend/AGENTS.md
git rm --cached frontend/CLAUDE.md
git rm --cached FRONTEND_TOKEN_MIGRATION.md

# Commit the cleanup
git commit -m "Remove development artifacts from tracking"
```

---

## 6. Deployment Verification Checklist

```bash
# ✅ Before packaging
[ ] rm -rf backend/uploads/
[ ] rm -rf .github/
[ ] rm -rf docs/
[ ] rm -rf site/
[ ] rm -f frontend/AGENTS.md frontend/CLAUDE.md
[ ] rm -f FRONTEND_TOKEN_MIGRATION.md
[ ] rm -f docs/postman/*.json
[ ] rm -rf .vscode/

# ✅ After build
[ ] Verify backend JAR does NOT contain dev files
[ ] Verify .next/ directory created successfully
[ ] Check frontend bundle size < 10MB
[ ] Verify no source maps in production

# ✅ Container image
[ ] Image size < 300MB
[ ] No node_modules in final layer
[ ] No Maven cache in final layer
```

---

## 7. Findings & Recommendations

| Finding | Severity | Action | Owner |
|---------|----------|--------|-------|
| Dev docs present | MEDIUM | Exclude from deployment | DevOps |
| Postman collections with hardcoded creds | HIGH | Delete before deployment | Security |
| .github/ CI/CD workflows | LOW | Exclude from deployment | DevOps |
| uploads/ directory | CRITICAL | Never commit to Git | Architect |

---

## Summary

✅ **DEPLOYMENT EXCLUSIONS: POLICY DEFINED**

**Critical Actions Before Go-Live:**

1. ✅ Delete all development directories (`.github/`, `docs/`, `site/`)
2. ✅ Delete all agent/configuration files (`AGENTS.md`, `CLAUDE.md`)
3. ✅ Delete Postman collections with hardcoded credentials
4. ✅ Verify `.gitignore` is comprehensive and tracked
5. ✅ Use cleanup script before each production build
6. ✅ Verify final JAR/image contains NO development artifacts

**Automated Solution:**

```bash
# Single command to prepare for deployment
./cleanup-for-deployment.sh && \
mvn clean package -DskipTests && \
npm run build --prefix frontend && \
docker build -t stratumiq:prod .
```
