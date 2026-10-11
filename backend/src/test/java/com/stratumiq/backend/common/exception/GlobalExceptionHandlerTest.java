package com.stratumiq.backend.common.exception;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private MockHttpServletRequest request;
    private MockHttpServletResponse servletResponse;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest("GET", "/api/equipment");
        request.addHeader("X-Request-ID", "equipment-test-123");
        servletResponse = new MockHttpServletResponse();
    }

    @Test
    void handleEntityNotFoundReturnsNotFoundResponse() {
        ResponseEntity<?> response = handler.handleEntityNotFound(new EntityNotFoundException("Ticket not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isInstanceOf(Map.class);

        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertThat(body).containsEntry("error", "Resource not found");
        assertThat(body).containsEntry("code", "NOT_FOUND");
    }

    @Test
    void handleGenericReturnsRequestIdWithoutInternalExceptionDetails() {
        ResponseEntity<?> response = handler.handleGeneric(
            new IllegalStateException("database password must not be returned"), request, servletResponse);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getHeaders().getFirst("X-Request-ID")).isEqualTo("equipment-test-123");
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertThat(body).containsEntry("error", "Internal server error")
            .containsEntry("requestId", "equipment-test-123")
            .doesNotContainKey("message")
            .doesNotContainKey("type");
    }

    @Test
    void missingRouteReturnsNotFoundInsteadOfInternalServerError() {
        ResponseEntity<?> response = handler.handleRouteNotFound(
            new NoResourceFoundException(HttpMethod.GET, "/api/equipment"), request, servletResponse);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getHeaders().getFirst("X-Request-ID")).isEqualTo("equipment-test-123");
    }
}
