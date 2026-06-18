package com.stratumiq.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

// Replaces your entire middleware/auth.middleware.js
// Runs once per request, validates Bearer token, attaches user to context
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // No token — pass through (public routes handled by SecurityConfig)
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            Claims claims = jwtUtil.validateAccessToken(token);

            Long userId   = Long.parseLong(claims.getSubject());
            String role   = claims.get("role", String.class);
            Long tenantId = claims.get("tenant_id", Long.class);

            // Build authorities from permissions list baked into JWT
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));

            @SuppressWarnings("unchecked")
            List<String> permissions = (List<String>) claims.get("permissions");
            if (permissions != null) {
                for (String perm : permissions) {
                    authorities.add(new SimpleGrantedAuthority("PERM_" + perm));
                }
            }

            // Attach principal — replaces req.user = { id, role }
            AuthenticatedUser principal = new AuthenticatedUser(userId, tenantId, role);
            System.out.println("[JWT DEBUG] Authorities: " + authorities);
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (ExpiredJwtException e) {
            sendError(response, 401, "Token expired");
            return;
        } catch (Exception e) {
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