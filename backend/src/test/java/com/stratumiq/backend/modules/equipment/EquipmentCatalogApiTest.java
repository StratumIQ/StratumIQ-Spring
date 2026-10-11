package com.stratumiq.backend.modules.equipment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EquipmentCatalogApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN", "PERM_equipment:view"})
    void authenticatedAdminCanCreateListFilterReadAndUpdateEquipment() throws Exception {
        String brand = "CatalogTest-" + UUID.randomUUID();
        String oemName = "OEMTest-" + UUID.randomUUID();
        String oemBody = """
            {"name":"%s","country":"IN","website":"https://example.test"}
            """.formatted(oemName);

        String oemResponse = mockMvc.perform(post("/api/equipment/oems")
                .contentType(MediaType.APPLICATION_JSON)
                .content(oemBody))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        long oemId = objectMapper.readTree(oemResponse).path("oem").path("oem_id").asLong();
        String firstId = createEquipment(brand, "Jaw 100", oemId);
        createEquipment(brand, "Jaw 200", null);

        String firstPage = mockMvc.perform(get("/api/equipment")
                .param("brand", brand)
                .param("page", "1")
                .param("limit", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.total").value(2))
            .andExpect(jsonPath("$.pages").value(2))
            .andReturn().getResponse().getContentAsString();
        String firstPageId = objectMapper.readTree(firstPage).path("data").get(0)
            .path("equipment_id").asText();

        String secondPage = mockMvc.perform(get("/api/equipment")
                .param("brand", brand)
                .param("page", "2")
                .param("limit", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1))
            .andReturn().getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(
            objectMapper.readTree(secondPage).path("data").get(0).path("equipment_id").asText())
            .isNotEqualTo(firstPageId);

        mockMvc.perform(get("/api/equipment").param("oem_id", Long.toString(oemId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(1))
            .andExpect(jsonPath("$.data[0].oem_name").value(oemName));

        mockMvc.perform(get("/api/equipment/{id}", firstId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.identity.brand").value(brand));

        mockMvc.perform(patch("/api/equipment/{id}", firstId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"brand\":\"" + brand + " Updated\",\"status\":\"active\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.equipment.status").value("active"));

        mockMvc.perform(get("/api/equipment")
                .param("brand", brand + " Updated")
                .param("page", "1")
                .param("limit", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1));
    }

    private String createEquipment(String brand, String modelName, Long oemId) throws Exception {
        String oemField = oemId == null ? "" : "\"oem_id\":" + oemId + ",";
        String body = """
            {%s"brand":"%s","model_name":"%s","equipment_type":"jaw_crusher",
             "mobility_type":"static","status":"draft"}
            """.formatted(oemField, brand, modelName);
        String response = mockMvc.perform(post("/api/equipment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("equipment_id").asText();
    }

    @Test
    @WithMockUser(authorities = "PERM_equipment:view")
    void emptySearchReturnsAnEmptyPageRatherThanAnError() throws Exception {
        mockMvc.perform(get("/api/equipment")
                .param("search", "no-match-" + UUID.randomUUID())
                .param("page", "1")
                .param("limit", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(0))
            .andExpect(jsonPath("$.total").value(0))
            .andExpect(jsonPath("$.pages").value(1));
    }

    @Test
    @WithMockUser(roles = "USER")
    void nonAdminCannotCreateCatalogEquipment() throws Exception {
        mockMvc.perform(post("/api/equipment")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"brand\":\"Acme\",\"model_name\":\"Jaw 100\","
                    + "\"equipment_type\":\"jaw_crusher\",\"mobility_type\":\"static\"}"))
            .andExpect(status().isForbidden());
    }
}
