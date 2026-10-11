package com.stratumiq.backend.entity;

import com.stratumiq.backend.common.enums.CurrencyType;
import com.stratumiq.backend.common.enums.PartCondition;
import com.stratumiq.backend.common.enums.PartStatus;
import com.stratumiq.backend.common.enums.PartType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "parts",
        indexes = {
                @Index(name = "idx_part_category", columnList = "category_id"),
                @Index(name = "idx_part_brand", columnList = "brand_id"),
                @Index(name = "idx_part_manufacturer", columnList = "manufacturer_id"),
                @Index(name = "idx_part_unit", columnList = "unit_of_measure_id"),
                @Index(name = "idx_part_status", columnList = "status"),
                @Index(name = "idx_part_dealer", columnList = "dealer_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Owner Information
     * Keep as IDs for now.
     * Later we can convert these into @ManyToOne(User).
     */

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    /*
     * Product Information
     */

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "part_number", nullable = false, unique = true, length = 120)
    private String partNumber;

    @Column(name = "oem_number", length = 150)
    private String oemNumber;

    @Column(name = "part_name", nullable = false, length = 250)
    private String partName;

    @Column(name = "seo_slug", length = 255)
    private String seoSlug;

    @Column(name = "short_description", length = 1000)
    private String shortDescription;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /*
     * Master Relationships
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private PartCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private PartBrand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private Manufacturer manufacturer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_of_measure_id", nullable = false)
    private UnitOfMeasure unitOfMeasure;

    /*
     * Pricing
     * These will move into DealerInventory later.
     */

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CurrencyType currency = CurrencyType.INR;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "discount_price", precision = 12, scale = 2)
    private BigDecimal discountPrice;

    /*
     * Inventory
     * Temporary until DealerInventory module.
     */

    @Builder.Default
    private Integer quantity = 0;

    /*
     * Product Details
     */

    @Enumerated(EnumType.STRING)
    @Column(name = "part_type")
    private PartType partType;

    @Enumerated(EnumType.STRING)
    @Column(name = "part_condition")
    private PartCondition partCondition;

    @Column(name = "warranty", length = 100)
    private String warranty;

    @Column(precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(precision = 10, scale = 2)
    private BigDecimal length;

    @Column(precision = 10, scale = 2)
    private BigDecimal width;

    @Column(precision = 10, scale = 2)
    private BigDecimal height;

    /*
     * Flags
     */

    @Builder.Default
    private Boolean featured = false;

    @Builder.Default
    private Boolean active = true;

    /*
     * Status
     */

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PartStatus status = PartStatus.ACTIVE;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    /*
     * Analytics
     */

    @Builder.Default
    @Column(name = "total_views")
    private Integer totalViews = 0;

    @Builder.Default
    @Column(name = "total_clicks")
    private Integer totalClicks = 0;

    @Builder.Default
    @Column(name = "total_leads")
    private Integer totalLeads = 0;

    /*
     * Audit
     */

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    /*
     * Images
     */

    @OneToMany(
            mappedBy = "part",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PartImage> images = new ArrayList<>();

    /*
     * Documents
     */

    @OneToMany(
            mappedBy = "part",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PartDocument> documents = new ArrayList<>();

    @OneToMany(
            mappedBy = "part",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PartAttribute> attributes = new ArrayList<>();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}