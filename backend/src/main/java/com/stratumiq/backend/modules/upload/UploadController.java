package com.stratumiq.backend.modules.upload;

import com.stratumiq.backend.modules.admin.service.AdminActivityLogger;
import com.stratumiq.backend.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final FileStorageService fileStorageService;
    private final AdminActivityLogger activityLogger;

    public UploadController(FileStorageService fileStorageService,
                            AdminActivityLogger activityLogger) {
        this.fileStorageService = fileStorageService;
        this.activityLogger = activityLogger;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AuthenticatedUser user) {
        String url = fileStorageService.storeFleetImage(file);
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload");
        metadata.put("fileSizeBytes", file.getSize());
        if (file.getContentType() != null) metadata.put("contentType", file.getContentType());
        metadata.put("url", url);

        activityLogger.log(
            user.tenantId(),
            user.userId(),
            user.userId(),
            "DOCUMENT_UPLOADED",
            "UPLOAD",
            null,
            metadata
        );

        return ResponseEntity.ok(Map.of(
            "url", url,
            "file_name", file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload",
            "file_size_bytes", file.getSize()
        ));
    }
}
