# Design: HU-05 — Carga Masiva de Productos via CSV

## Technical Approach

Full-stack feature spanning both repositories. The Frontend provides a dedicated view for CSV upload with client-side header validation (using `papaparse`), async status polling, and error report download. The Backend introduces chunked upload endpoints following the tus-inspired session/chunk/complete pattern researched in CHANGELOG_SOURCES (Day 2), asynchronous CSV processing via a Worker, JPA batch inserts with staging table (ER model v2), and error CSV generation.

The design honors the existing **hexagonal architecture** (ports/usecases/adapters) in Kitchen-Services and the **hook + service singleton** pattern in FoodTech-Front.

## Architecture Decisions

| # | Decision | Alternatives Rejected | Rationale |
|---|----------|-----------------------|-----------|
| 1 | **Chunked upload (session/chunk/complete)** over single POST | Single multipart POST | Per CHANGELOG Day 2 research: tolerant to network failures, resumable, no OOM risk for large files. Uses `Blob.slice()` on client. |
| 2 | **`papaparse`** for client-side CSV header validation | Manual string split / server-only validation | Instant user feedback before upload; well-maintained lib; avoids server round-trip for structure errors. |
| 3 | **ProductStaging table** (ETL pattern) | Direct insert into Product table | Per CHANGELOG ER v2 analysis: isolates validated data from final catalog, allows rollback of failed batches without corrupting production data. |
| 4 | **JPA batch with `hibernate.jdbc.batch_size: 50`** | JDBC native / DB bulk tools | Per CHANGELOG Day 2 batch research: good balance for ≤100K rows, reuses existing JPA/Hibernate stack, granular error feedback per row. |
| 5 | **Polling (`GET /status`)** for async processing state | WebSocket / SSE | Simplest to implement; aligns with existing `fetch`-based `ApiClient`; processing is short-lived for ≤10MB files. |
| 6 | **Feature flag** `feature.product-bulk-upload.enabled` | Always-on | Follows existing `@ConditionalOnProperty` pattern on `ProductController`. |

## Data Flow

```
┌─────────┐     POST /upload/init         ┌──────────────┐
│ Frontend │ ─────────────────────────────►│  Upload      │──► DB: UploadSession
│ (React)  │     POST /upload/{id}/chunk   │  Controller  │──► Disk: chunk files
│          │ ─────────────────────────────►│              │
│          │     POST /upload/{id}/complete │              │──► Assembler ──► UploadedFile
│          │ ─────────────────────────────►│              │──► Trigger Worker
│          │                               └──────────────┘
│          │     GET /upload/{id}/status                        ┌──────────┐
│          │ ──────────────────────────────────────────────────►│  Worker   │
│          │     GET /upload/{id}/errors                        │ (Async)  │
│          │ ──────────────────────────────────────────────────►│          │
└─────────┘                                                     └──────────┘
                                                                  │
                                                    Read CSV ──► ProductStaging
                                                    Validate ──► ErrorRecord
                                                    Upsert  ──► Product
```

## File Changes

### FoodTech-Front

| File | Action | Description |
|------|--------|-------------|
| `src/views/admin/BulkUploadView.tsx` | Create | Main view: upload form, progress indicator, summary, error download |
| `src/components/admin/CSVUploader.tsx` | Create | File input, client-side header validation via `papaparse`, chunked upload logic with `Blob.slice()` |
| `src/components/admin/UploadProgress.tsx` | Create | Progress bar + status text ("En progreso", "Finalizado") |
| `src/components/admin/UploadSummary.tsx` | Create | Shows created/updated/errors counts + download error CSV button |
| `src/hooks/useBulkUpload.ts` | Create | Hook: `{upload, status, summary, errorUrl, isUploading, isProcessing, error, pollStatus}` |
| `src/services/bulkUploadService.ts` | Create | Service class: `initSession()`, `uploadChunk()`, `completeUpload()`, `getStatus()`, `downloadErrors()`, `downloadTemplate()` |
| `src/services/apiClient.ts` | Modify | Add `postMultipart<T>(endpoint, formData): Promise<T>` and `getBlob(endpoint): Promise<Blob>` methods |
| `src/models/BulkUpload.ts` | Create | Interfaces: `UploadSession`, `UploadStatus`, `UploadSummary`, `ChunkResponse` |
| `src/App.tsx` | Modify | Add route `/admin/carga-masiva` → `BulkUploadView` |
| `public/plantilla_productos.csv` | Create | Template CSV file with correct headers and 2 example rows |
| `package.json` | Modify | Add `papaparse` + `@types/papaparse` |

### FoodTech-Kitchen-Services

| File | Action | Description |
|------|--------|-------------|
| `infrastructure/rest/BulkUploadController.java` | Create | Endpoints: init, chunk, complete, status, errors, template download |
| `infrastructure/rest/dto/InitUploadResponse.java` | Create | `{uploadId, status}` |
| `infrastructure/rest/dto/UploadStatusResponse.java` | Create | `{uploadStatus, processingStatus, created, updated, errors}` |
| `application/ports/in/BulkUploadProductsPort.java` | Create | Input port interface |
| `application/usecases/BulkUploadProductsUseCase.java` | Create | Orchestrates: parse CSV → staging → validate → upsert Product |
| `application/usecases/dto/BulkUploadResult.java` | Create | `{created, updated, errorCount, errorRecords}` |
| `application/ports/out/UploadSessionRepository.java` | Create | Output port for UploadSession/Chunk/File |
| `domain/model/upload/UploadSession.java` | Create | Domain model per ER v2 |
| `domain/model/upload/UploadChunk.java` | Create | Domain model per ER v2 |
| `domain/model/upload/UploadedFile.java` | Create | Domain model per ER v2 |
| `domain/model/upload/ProductStaging.java` | Create | Staging record with error_message field |
| `domain/model/upload/ErrorRecord.java` | Create | `{rowNumber, rawData, errorCode, errorMessage}` |
| `infrastructure/persistence/jpa/entities/UploadSessionEntity.java` | Create | JPA entity (GenerationType.SEQUENCE) |
| `infrastructure/persistence/jpa/entities/UploadChunkEntity.java` | Create | JPA entity |
| `infrastructure/persistence/jpa/entities/UploadedFileEntity.java` | Create | JPA entity |
| `infrastructure/persistence/jpa/entities/ProductStagingEntity.java` | Create | JPA entity |
| `infrastructure/persistence/jpa/entities/ErrorRecordEntity.java` | Create | JPA entity |
| `infrastructure/persistence/adapters/UploadRepositoryAdapter.java` | Create | Implements output ports |
| `infrastructure/config/ApplicationConfig.java` | Modify | Register new use case beans |
| `src/main/resources/application.yaml` | Modify | Add `hibernate.jdbc.batch_size: 50`, `spring.servlet.multipart.max-file-size: 100MB` |
| `build.gradle` | Modify | Add `com.opencsv:opencsv:5.9` dependency |

## Interfaces / Contracts

```typescript
// Frontend — BulkUpload.ts
export interface UploadSession { uploadId: string; status: string; }
export interface UploadSummary {
  uploadStatus: 'UPLOADING' | 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processingStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  totalRecords: number; created: number; updated: number; errors: number;
}
```

```java
// Backend — BulkUploadProductsPort.java
public interface BulkUploadProductsPort {
    UploadSession initSession(String fileName);
    void receiveChunk(UUID uploadId, int chunkIndex, byte[] data, String checksum);
    BulkUploadResult completeAndProcess(UUID uploadId);
    UploadSession getStatus(UUID uploadId);
    byte[] getErrorsCsv(UUID uploadId);
}
```

**REST Contract:**

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/upload/init` | `{fileName}` | `201 {uploadId, status}` |
| POST | `/api/upload/{id}/chunk` | `multipart: chunk, chunkIndex, checksum` | `200 {received}` |
| POST | `/api/upload/{id}/complete` | — | `202 {status: PROCESSING}` |
| GET | `/api/upload/{id}/status` | — | `200 UploadSummary` |
| GET | `/api/upload/{id}/errors` | — | `200 text/csv` |
| GET | `/api/upload/template` | — | `200 text/csv` |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (Front) | `useBulkUpload` hook, header validation logic, chunk splitting | Vitest + mocked service |
| Unit (Front) | `CSVUploader`, `UploadSummary` components | Vitest + Testing Library |
| Unit (Back) | `BulkUploadProductsUseCase` — parsing, validation, upsert logic | JUnit 5 + Mockito, H2 |
| Unit (Back) | Domain models: `UploadSession`, `ProductStaging` state transitions | JUnit 5 |
| Integration (Back) | Full flow: init → chunk → complete → status → errors | `@SpringBootTest` + H2 + real CSV file |
| Integration (Front) | Upload flow end-to-end with mocked backend | Vitest with MSW or Cypress component |

## Migration / Rollout

1. **DB Migration**: New tables (`upload_session`, `upload_chunk`, `uploaded_file`, `product_staging`, `error_record`, `processing_log`) — add via Flyway/Liquibase or `ddl-auto` in dev.
2. **Feature flag**: Gate behind `feature.product-bulk-upload.enabled=false` initially; enable per environment.
3. **Backend entities** use `GenerationType.SEQUENCE` (not IDENTITY) to support JPA batching per CHANGELOG Day 2 research.
4. Existing `ProductEntity` uses `IDENTITY` — **do not change** in this PR; only new upload entities use SEQUENCE.

## Open Questions

- [ ] Should polling interval be configurable? (Proposed default: 3 seconds)
- [ ] Max concurrent uploads per admin session — limit to 1?
- [ ] Should the `estacion` CSV column map to `ProductType` enum (BAR→DRINK, HOT_KITCHEN→HOT_DISH, COLD_KITCHEN→COLD_DISH) or be stored as-is?
