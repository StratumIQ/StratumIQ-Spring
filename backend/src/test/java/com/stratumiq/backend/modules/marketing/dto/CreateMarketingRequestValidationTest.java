package com.stratumiq.backend.modules.marketing.dto;

import com.stratumiq.backend.common.enums.MarketingContentType;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CreateMarketingRequestValidationTest {

    @Test
    void createRequestRequiresBannerAndThumbnailUrls() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        Validator validator = factory.getValidator();

        CreateMarketingRequest request = new CreateMarketingRequest();
        request.setType(MarketingContentType.NEWS);
        request.setTitle("Launch update");
        request.setBody("A new announcement");
        request.setPriority(1);

        var violations = validator.validate(request);

        assertThat(violations)
            .extracting(v -> v.getMessage())
            .contains("Banner image is required", "Thumbnail image is required");
    }
}
