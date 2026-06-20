package com.stratumiq.backend.common.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.stream.Collectors;

// Replaces:
//   withErrorHandling wrapper in equipment.controller.js
//   fail(res, 400/404/500) helpers in all controllers
//   Global 404/500 handlers in app.js
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Replaces Joi validation error → 400 in all controllers
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                (a, b) -> a
            ));
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Validation failed",
            "code", "VALIDATION_ERROR",
            "fields", fields
        ));
    }

    // Replaces err.code === '23505' duplicate check in equipment.controller.js
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDbConstraint(DataIntegrityViolationException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "";
        if (msg.contains("23505") || msg.contains("unique")) {
            return ResponseEntity.status(409)
                .body(Map.of("error", "Record already exists — use PATCH to update"));
        }
        if (msg.contains("23503") || msg.contains("foreign key")) {
            return ResponseEntity.status(404)
                .body(Map.of("error", "Referenced record not found"));
        }
        return ResponseEntity.status(500)
            .body(Map.of("error", "Database constraint violation"));
    }

    // Handles type mismatches in path/query parameters (e.g., ?id=abc when int expected)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Validation failed",
            "code", "VALIDATION_ERROR",
            "fields", Map.of(ex.getName(), "Invalid type: expected " + ex.getRequiredType().getSimpleName())
        ));
    }

    // Handles service-layer @Valid constraints (MethodValidationPostProcessor)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> fields = ex.getConstraintViolations().stream()
            .collect(Collectors.toMap(
                cv -> cv.getPropertyPath().toString(),
                ConstraintViolation::getMessage,
                (a, b) -> a
            ));
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Validation failed",
            "code", "VALIDATION_ERROR",
            "fields", fields
        ));
    }

    // Handles all ResponseStatusException throws from services
    // (our clean replacement for fail(res, status, message))
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
            .body(Map.of("error", ex.getReason()));
    }

    // Replaces global 500 handler in app.js
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        // Log full exception details for production debugging
        String errorId = "ERR-" + System.currentTimeMillis();
        logger.error("[{}] Unhandled exception: {} - {}", 
            errorId, 
            ex.getClass().getSimpleName(), 
            ex.getMessage(), 
            ex);
        
        // Log root cause if available
        if (ex.getCause() != null) {
            logger.error("[{}] Root cause: {} - {}", 
                errorId,
                ex.getCause().getClass().getSimpleName(),
                ex.getCause().getMessage());
        }
        
        return ResponseEntity.status(500)
            .body(Map.of(
                "error", "Internal server error",
                "errorId", errorId,
                "type", ex.getClass().getSimpleName(),
                "message", ex.getMessage() != null ? ex.getMessage() : "Unknown error"
            ));
    }
}