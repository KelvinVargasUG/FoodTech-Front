# Tasks: HU-05 — Carga Masiva de Productos via CSV

## Phase 1: Foundation — Domain Models & Config (Backend)

- [ ] 1.1 Add `com.opencsv:opencsv:5.9` to `build.gradle` and sync dependencies
- [ ] 1.2 Create `domain/model/upload/UploadSession.java` — immutable domain object with `id`, `fileName`, `uploadStatus`, `processingStatus`, `totalRecords`, `created`, `updated`, `createdBy`, audit fields
- [ ] 1.3 Create `domain/model/upload/UploadChunk.java` — `id`, `uploadId`, `chunkIndex`, `size`, `checksum`, `status`, `filePath`, audit fields
- [ ] 1.4 Create `domain/model/upload/UploadedFile.java` — `id`, `uploadId`, `filePath`, `fileSize`, `checksum`, `assembledAt`, audit fields
- [ ] 1.5 Create `domain/model/upload/ProductStaging.java` — mirrors CSV columns (`name`, `price`, `category`, `station`, `description`, `status`) plus `uploadId`, `errorMessage`
- [ ] 1.6 Create `domain/model/upload/ErrorRecord.java` — `rowNumber`, `rawData`, `errorCode`, `errorMessage`, `uploadId`
- [ ] 1.7 Create JPA entities for all upload domain objects using `GenerationType.SEQUENCE`: `UploadSessionEntity`, `UploadChunkEntity`, `UploadedFileEntity`, `ProductStagingEntity`, `ErrorRecordEntity`
- [ ] 1.8 Update `application.yaml`: add `hibernate.jdbc.batch_size: 50`, `spring.servlet.multipart.max-file-size: 100MB`, `spring.servlet.multipart.max-request-size: 110MB`, and `feature.product-bulk-upload.enabled: true`

## Phase 2: Backend — Ports, Use Case & Repository Adapter

- [ ] 2.1 Create `application/ports/out/UploadSessionRepository.java` — output port: `saveSession()`, `saveChunk()`, `saveFile()`, `findSessionById()`, `saveAllStaging()`, `findStagingByUploadId()`, `saveError()`, `findErrorsByUploadId()`
- [ ] 2.2 Create `application/ports/in/BulkUploadProductsPort.java` — input port: `initSession()`, `receiveChunk()`, `completeAndProcess()`, `getStatus()`, `getErrorsCsv()`
- [ ] 2.3 Create `application/usecases/dto/BulkUploadResult.java` — `{created, updated, errorCount, List<ErrorRecord>}`
- [ ] 2.4 Create `application/usecases/BulkUploadProductsUseCase.java` implementing `BulkUploadProductsPort` — orchestrates: parse CSV with opencsv → validate each row (station enum check, price > 0, required fields) → `existsByName()` → upsert `ProductStaging` → JPA batch flush/clear every 50 → move to `Product` → accumulate `ErrorRecord` list
- [ ] 2.5 Create `infrastructure/persistence/adapters/UploadRepositoryAdapter.java` implementing `UploadSessionRepository` + disk chunk assembly via `Files.write` / `Files.newInputStream`
- [ ] 2.6 Register `BulkUploadProductsPort` bean in `infrastructure/config/ApplicationConfig.java` following existing explicit-bean pattern

## Phase 3: Backend — REST Controller

- [ ] 3.1 Create `infrastructure/rest/dto/InitUploadRequest.java`, `InitUploadResponse.java`, `ChunkResponse.java`, `UploadStatusResponse.java`
- [ ] 3.2 Create `infrastructure/rest/BulkUploadController.java` with `@ConditionalOnProperty("feature.product-bulk-upload.enabled")`:
  - `POST /api/upload/init` → `201 InitUploadResponse`
  - `POST /api/upload/{id}/chunk` (multipart: `file`, `chunkIndex`, `checksum`) → `200 ChunkResponse`
  - `POST /api/upload/{id}/complete` → `202` (triggers async processing)
  - `GET /api/upload/{id}/status` → `200 UploadStatusResponse`
  - `GET /api/upload/{id}/errors` → `200 text/csv` download
  - `GET /api/upload/template` → `200 text/csv` plantilla download
- [ ] 3.3 Add handlers for `CsvValidationException` and `ChunkAssemblyException` in `GlobalExceptionHandler.java` returning `400`

## Phase 4: Frontend — Foundation (Models, Service, ApiClient)

- [ ] 4.1 Add `papaparse` and `@types/papaparse` to `package.json`
- [ ] 4.2 Create `src/models/BulkUpload.ts` — `UploadSession`, `UploadSummary`, `ChunkResponse`, `UploadStatusEnum` using `const + typeof` pattern
- [ ] 4.3 Extend `src/services/apiClient.ts`: add `postMultipart<T>(endpoint, formData): Promise<T>` and `getBlob(endpoint): Promise<Blob>` methods
- [ ] 4.4 Create `src/services/bulkUploadService.ts` singleton: `initSession()`, `uploadChunk()`, `completeUpload()`, `getStatus()`, `downloadErrors()`, `downloadTemplate()`
- [ ] 4.5 Create `src/hooks/useBulkUpload.ts`: `useState` + `useCallback` wrapping service calls; returns `{upload, pollStatus, status, summary, isUploading, isProcessing, error, reset}`
- [ ] 4.6 Add CSV header validation helper using `papaparse` — check headers match `['nombre','precio','categoria','estacion','descripcion','estado']` before upload

## Phase 5: Frontend — Components & View Wiring

- [ ] 5.1 Create `public/plantilla_productos.csv` — headers + 2 example rows with valid data (one HOT_KITCHEN, one BAR)
- [ ] 5.2 Create `src/components/admin/CSVUploader.tsx` — file input (10MB limit), header validation on select, triggers chunked upload via hook using `Blob.slice()`
- [ ] 5.3 Create `src/components/admin/UploadProgress.tsx` — status badge ("En progreso" / "Finalizado" / "Error") + polling feedback
- [ ] 5.4 Create `src/components/admin/UploadSummary.tsx` — shows `created/updated/errors` counts + "Descargar reporte de errores" button (visible only if `errors > 0`)
- [ ] 5.5 Create `src/views/admin/BulkUploadView.tsx` — composes `CSVUploader` + `UploadProgress` + `UploadSummary` + "Descargar plantilla" link
- [ ] 5.6 Add route `/admin/carga-masiva` → `<BulkUploadView />` in `src/App.tsx`
- [ ] 5.7 Add "Carga Masiva" navigation link in `src/components/Navigation.tsx` (visible only for admin role)

## Phase 6: Testing

- [ ] 6.1 **[RED]** Write failing unit test for `BulkUploadProductsUseCase` — valid CSV creates/updates products and registers errors (JUnit 5 + Mockito)
- [ ] 6.2 **[GREEN]** Make 6.1 pass
- [ ] 6.3 **[RED]** Write failing unit test for `BulkUploadController` — `POST /init`, `chunk`, `complete`, `status`, `errors` with MockMvc
- [ ] 6.4 **[GREEN]** Make 6.3 pass
- [ ] 6.5 Write integration test `BulkUploadFlowIT.java` — full flow with real CSV file, H2 DB, `@SpringBootTest`
- [ ] 6.6 **[RED]** Write failing Vitest unit test for `useBulkUpload` hook — upload flow, polling, error state
- [ ] 6.7 **[GREEN]** Make 6.6 pass
- [ ] 6.8 Write Vitest component test for `CSVUploader` — invalid file rejected, valid file triggers upload, header mismatch shows error (aligns with Spec CA1)
- [ ] 6.9 Write Vitest component test for `UploadSummary` — shows summary text, download button present only when `errors > 0` (aligns with Spec CA5, CA6)

## Phase 7: Cleanup & Documentation

- [ ] 7.1 Verify `feature.product-bulk-upload.enabled=false` in test `application-test.yaml` if integration tests need isolation
- [ ] 7.2 Run full test suite (`npm test -- --run` + `./gradlew test`) and confirm no regressions
- [ ] 7.3 Run `npm run lint` and `./gradlew build` — resolve all warnings/errors
