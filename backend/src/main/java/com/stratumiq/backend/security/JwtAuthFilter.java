package com.stratumiq.backend.security;

import com.stratumiq.backend.common.enums.AccountStatus;
import com.stratumiq.backend.entity.User;
import com.stratumiq.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

// Replaces your entire middleware/auth.middleware.js
// Runs once per request, validates Bearer token, attaches user to context
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;
    private final JwtSecurityEnhancements jwtEnhancements;
    private final UserRepository userRepo;

    public JwtAuthFilter(JwtUtil jwtUtil, JwtSecurityEnhancements jwtEnhancements, UserRepository userRepo) {
        this.jwtUtil = jwtUtil;
        this.jwtEnhancements = jwtEnhancements;
        this.userRepo = userRepo;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain chain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();
        logger.debug("Processing request: {} {}", requestMethod, requestPath);

        String token = null;
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            logger.debug("Token found in Authorization header");
        } else if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    token = cookie.getValue();
                    logger.debug("Token found in cookie");
                    break;
                }
            }
        }

        // No token — pass through (public routes handled by SecurityConfig)
        if (token == null) {
            logger.debug("No token provided for {} {}", requestMethod, requestPath);
            chain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtUtil.validateAccessToken(token);
            Long userId = Long.parseLong(claims.getSubject());
            logger.debug("Token validated for user: {}", userId);

            // Reject access tokens that have been explicitly blacklisted
           // Redis disabled temporarily
// if (jwtEnhancements.isBlacklisted(token)) {
//     sendError(response, 403, "Invalid token");
//     return;
// }

            User user = userRepo.findById(userId).orElse(null);
            if (user == null) {
                logger.error("User not found in database: {}", userId);
                sendError(response, 403, "Account not found");
                return;
            }
            
            if (user.getAccountStatus() != AccountStatus.ACTIVE) {
                logger.warn("Inactive account attempted access: {} ({})", user.getEmail(), user.getAccountStatus());
                sendError(response, 403, "Account inactive");
                return;
            }

            String currentRole = user.getRole().name();
            Long currentTenantId = user.getTenantId();

            // Build authorities from current role state in the database
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + currentRole));
            for (String perm : RolePermissionProvider.permissionsForRole(user.getRole())) {
                authorities.add(new SimpleGrantedAuthority("PERM_" + perm));
            }

            AuthenticatedUser principal = new AuthenticatedUser(userId, currentTenantId, currentRole);
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);
            logger.debug("Authentication set for user: {} role: {}", userId, currentRole);

        } catch (ExpiredJwtException e) {
            logger.warn("Expired token attempted: {}", e.getMessage());
            sendError(response, 401, "Token expired");
            return;
        } catch (Exception e) {
            logger.error("Token validation failed", e);
            sendError(response, 403, "Invalid token");
            return;
        }

        chain.doFilter(request, response);
    }

    private void sendError(HttpServletResponse res, int status, String msg)
            throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.getWriter().write("{\"error\":\"" + msg + "\"}");
    }
}