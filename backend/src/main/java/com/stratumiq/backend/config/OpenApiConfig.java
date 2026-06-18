package com.stratumiq.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI stratumiqOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("StratumIQ API")
                .description("StratumIQ platform API including Admin endpoints")
                .version("1.0"))
            .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
            .schemaRequirement("BearerAuth", new SecurityScheme()
                .name("BearerAuth")
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT"));
    }
}
