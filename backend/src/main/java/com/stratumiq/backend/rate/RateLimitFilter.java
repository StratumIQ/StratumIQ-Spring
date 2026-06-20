package com.stratumiq.backend.rate;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Bucket4j-based rate limiter using in-memory buckets.
 * Thread-safe and accurate for single-instance deployments.
 * For clustered deployments, integrate with Redis-backed ProxyManager later.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    // simple mapping for endpoints -> limit (count, seconds)
    private final Map<String, int[]> ipLimits = Map.of(
        "/api/auth/login", new int[]{5, 60},
        "/api/auth/register", new int[]{3, 3600},
        "/api/auth/send-phone-otp", new int[]{5, 3600},
        "/api/auth/verify-phone-otp", new int[]{5, 3600},
        "/api/auth/refresh", new int[]{30, 60}
    );

    // per-user limits (authenticated)
    private final int API_USER_LIMIT = 100; // per minute
    private final int ADMIN_USER_LIMIT = 50; // per minute

    // buckets store (key -> Bucket)
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
            .map(value -> value.split(",")[0].trim())
            .filter(it -> !it.isBlank())
            .orElse(request.getRemoteAddr());

        // IP-based limits for anonymous/auth endpoints
        for (var entry : ipLimits.entrySet()) {
            String match = entry.getKey();
            if (path.startsWith(match)) {
                int[] cfg = entry.getValue();
                int limit = cfg[0];
                int seconds = cfg[1];
                String key = "b4j:ip:" + match + ":" + ip;
                Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(limit, Duration.ofSeconds(seconds)));
                if (!bucket.tryConsume(1)) {
                    logger.warn("Rate limit exceeded for IP {} on endpoint {}", ip, match);
                    response.setStatus(429);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Too many requests\",\"code\":\"RATE_LIMIT_EXCEEDED\"}");
                    return;
                } else {
                    logger.debug("Rate limit check passed for IP {} on endpoint {}", ip, match);
                }
            }
        }

        // Per-user limits when authenticated
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String userKey = null;
        boolean isAdmin = false;
        if (principal instanceof org.springframework.security.core.Authentication auth && auth.isAuthenticated() && auth.getPrincipal() instanceof com.stratumiq.backend.security.AuthenticatedUser au) {
            userKey = String.valueOf(au.userId());
            isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().startsWith("ROLE_") && a.getAuthority().contains("ADMIN"));
        }

        if (userKey != null) {
            int limit = isAdmin ? ADMIN_USER_LIMIT : API_USER_LIMIT;
            String key = "b4j:user:minute:" + userKey;
            Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(limit, Duration.ofMinutes(1)));
            if (!bucket.tryConsume(1)) {
                logger.warn("Rate limit exceeded for user {} (admin: {})", userKey, isAdmin);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Too many requests\",\"code\":\"RATE_LIMIT_EXCEEDED_USER\"}");
                return;
            } else {
                logger.debug("Rate limit check passed for user {} (limit: {})", userKey, limit);
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket newBucket(int capacity, Duration refillPeriod) {
        Refill refill = Refill.intervally(capacity, refillPeriod);
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket4j.builder().addLimit(limit).build();
    }
}

            String key = "b4j:user:minute:" + userKey;
            Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(limit, Duration.ofMinutes(1)));
            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Too many requests\",\"code\":\"RATE_LIMIT_EXCEEDED_USER\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket newBucket(int capacity, Duration refillPeriod) {
        Refill refill = Refill.intervally(capacity, refillPeriod);
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket4j.builder().addLimit(limit).build();
    }
}
