package com.stratumiq.backend.modules.upload;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final FileStorageService fileStorageService;

    public UploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFleetImage(file);
        return ResponseEntity.ok(Map.of(
            "url", url,
            "file_name", file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload",
            "file_size_bytes", file.getSize()
        ));
    }
}
