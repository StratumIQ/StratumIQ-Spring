# Bug Fix Log

## AUTH-SEC-001: Authentication logs exposed account email addresses

- **Severity:** P2
- **Status:** Fixed; behavior-preserving verification completed.
- **Reproduction:** Submit registration or login requests and inspect application logs; email addresses were interpolated into controller/service log messages. Failed login exceptions were also printed directly with `printStackTrace()`.
- **Root cause:** Auth handlers logged request identifiers unnecessarily and wrapped/rethrew login exceptions after writing them to stderr.
- **Affected files:** `backend/src/main/java/com/stratumiq/backend/modules/auth/AuthController.java`, `backend/src/main/java/com/stratumiq/backend/modules/auth/AuthService.java`.
- **Fix:** Replaced email-bearing log messages with generic events and removed the redundant catch/print/rethrow wrapper. Authentication responses, lockout logic, and activity records were left unchanged.
- **Regression verification:** Backend sources compiled; all 9 database-independent backend tests passed. A full run had 1 context-load error due to rejected PostgreSQL credentials. No dedicated auth logging test exists yet.

## AUTH-SEC-002: OTPs and a hardcoded password were printed to stdout

- **Severity:** P1
- **Status:** Secret disclosure mitigated; OTP delivery workflow remains blocked.
- **Reproduction:** Register or request phone verification and inspect stdout; the generated OTP was printed. Running `PasswordGenerator` printed a hardcoded `Admin@123` password and its hash.
- **Root cause:** Temporary console-based OTP delivery and a hardcoded password-generation utility remained in production source.
- **Affected files:** `backend/src/main/java/com/stratumiq/backend/modules/auth/AuthService.java`, `backend/src/main/java/com/stratumiq/backend/util/PasswordGenerator.java`.
- **Fix:** Removed OTP console output. Replaced the password utility's hardcoded value with hidden interactive input and hash-only output, and zeroed the input buffer afterward.
- **Remaining blocker:** No email/SMS provider integration or configuration exists. Registration currently claims an email verification code was sent, but there is no delivery path; phone verification has the same gap. Do not treat signup as production-ready until an approved provider and delivery behavior are implemented.
- **Regression verification:** Backend recompiled and all 9 database-independent tests passed after the change; `PartServiceImplTest` was then rerun separately (3 passed). Full context test remains blocked by PostgreSQL credentials. No OTP delivery integration test exists.

## AUTH-UX-001: Password recovery control has no action

- **Severity:** P2
- **Status:** Open; implementation is blocked on product behavior.
- **Reproduction:** On `/auth`, activate "Forgot password?". The button has no handler. No password recovery/reset endpoint or frontend flow was found.
- **Root cause:** A visible recovery affordance exists without a corresponding recovery workflow.
- **Affected area:** `frontend/src/app/auth/page.tsx`; authentication API has no reset operation.
- **Fix:** None. A recovery delivery channel, verification policy, token lifetime, and reset rules are not specified; inventing those would alter security-sensitive behavior.
- **Regression test:** Not applicable until recovery behavior is defined. The gap is recorded in `QA_TEST_PLAN.md` and `QA_EXECUTION_REPORT.md`.
