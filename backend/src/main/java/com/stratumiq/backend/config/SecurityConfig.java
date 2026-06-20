package com.stratumiq.backend.config;

import com.stratumiq.backend.security.JwtAuthFilter;
import com.stratumiq.backend.rate.RateLimitFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.stratumiq.backend.filter.InputSanitizationFilter;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import java.util.List;

// Replaces:
//   1. app.use(cors({...}))           from app.js
//   2. router.use(authenticate)       from all route files
//   3. Public GET routes in equipment from equipment.routes.js
@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // enables @PreAuthorize on controller methods
public class SecurityConfig {

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;
    private final InputSanitizationFilter inputSanitizationFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, RateLimitFilter rateLimitFilter, InputSanitizationFilter inputSanitizationFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rateLimitFilter = rateLimitFilter;
        this.inputSanitizationFilter = inputSanitizationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                .frameOptions(frame -> frame.deny())
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self';"
                ))
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
            )
            .authorizeHttpRequests(auth -> auth

                // ── Public routes ──────────────────────────────
                // Replaces: no authenticate middleware on auth routes
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()

                // Replaces: public GETs in equipment.routes.js
                // Health check — replaces app.get("/", ...)
                .requestMatchers("/").permitAll()

                // OpenAPI / Swagger UI
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // Uploaded assets (fleet images)
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                // Admin API — role enforced at method level too
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // ── Everything else needs valid JWT ────────────
                // Replaces: router.use(authenticate) in fleet/dashboard routes
                .anyRequest().authenticated()
            )
            .addFilterBefore(inputSanitizationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(rateLimitFilter, JwtAuthFilter.class);

        return http.build();
    }

    // Replaces app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigin));
        config.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        config.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-CSRF-Token", "X-Forwarded-For"
        ));
        config.setAllowCredentials(true);  // needed for cookie (refreshToken)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // Replaces bcrypt with SALT_ROUNDS=10 from hash.js
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    // Enable service-layer @Valid/@Validated constraint validation
    @Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
        return new MethodValidationPostProcessor();
    }
}