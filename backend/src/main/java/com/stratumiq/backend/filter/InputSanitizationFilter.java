package com.stratumiq.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.StreamUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * INPUT SANITIZATION FILTER
 * 
 * NOTE: This filter is NOT auto-registered as a @Component.
 * To use it, explicitly add it to SecurityConfig.filterChain()
 * via: .addFilterBefore(inputSanitizationFilter, UsernamePasswordAuthenticationFilter.class)
 * 
 * Why @Component was removed:
 * - Causes auto-registration even when commented out in SecurityConfig
 * - Consumes request body before Spring can deserialize @RequestBody
 * - Breaks POST endpoints with JSON payloads (e.g., /api/auth/login)
 */
public class InputSanitizationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        HttpServletRequest wrappedRequest = request instanceof ContentCachingRequestWrapper
            ? request
            : new ContentCachingRequestWrapper(request);

        StringBuilder payload = new StringBuilder();
        payload.append(wrappedRequest.getRequestURI());
        if (wrappedRequest.getQueryString() != null) {
            payload.append(" ").append(wrappedRequest.getQueryString());
        }
        wrappedRequest.getParameterMap().values().forEach(values -> {
            for (String value : values) {
                payload.append(" ").append(value);
            }
        });

        String contentType = wrappedRequest.getContentType();
        if (contentType != null && contentType.toLowerCase().contains("application/json")) {
            String body = StreamUtils.copyToString(wrappedRequest.getInputStream(), StandardCharsets.UTF_8);
            if (!body.isBlank()) {
                payload.append(" ").append(body);
            }
        }

        String normalized = payload.toString().toLowerCase();
        if (containsDangerousPayload(normalized)) {
            response.setStatus(400);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Bad request\"}");
            return;
        }

        filterChain.doFilter(wrappedRequest, response);
    }

    private boolean containsDangerousPayload(String payload) {
        return payload.contains("<script") ||
            payload.contains("javascript:") ||
            payload.contains("onerror=") ||
            payload.contains("onload=") ||
            payload.contains("document.cookie") ||
            payload.contains("window.location");
    }
}
