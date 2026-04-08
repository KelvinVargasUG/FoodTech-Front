# Admin Catalog Specification

## Purpose

This specification defines the behavior for the bulk upload (Carga Masiva) of products by an Administrator into the catalog using a CSV file. It covers file validation, asynchronous processing, creation/updating logic, error handling, and reporting.

## Requirements

### Requirement: CSV File and Header Validation

The system MUST validate the uploaded CSV file before processing its contents.

#### Scenario: User uploads a valid CSV file
- GIVEN the Administrator is on the "Carga Masiva de Productos" section
- AND the Administrator selects a CSV file under 10MB
- WHEN they click "Procesar"
- THEN the system MUST validate that the headers match exactly: `nombre`, `precio`, `categoria`, `estacion`, `descripcion`, `estado`
- AND the system MUST accept the file for processing.

#### Scenario: User uploads an invalid CSV file
- GIVEN the Administrator is on the "Carga Masiva de Productos" section
- AND selects a CSV file with incorrect headers or exceeding 10MB
- WHEN they click "Procesar"
- THEN the system MUST reject the file immediately
- AND show a clear error message indicating the structure is invalid.

### Requirement: Asynchronous Processing and Notification

The system MUST process the valid CSV file asynchronously to prevent UI blocking.

#### Scenario: Processing starts
- GIVEN the system has accepted a valid CSV file
- WHEN the upload and processing start
- THEN the system MUST initiate a background (asynchronous) process
- AND display an "En progreso" indicator in the UI.

### Requirement: Existing Product Update

The system MUST update existing products if the product name matches an existing record.

#### Scenario: Row matches an existing product
- GIVEN the background process is reading a CSV row
- WHEN the product `nombre` already exists in the database
- THEN the system MUST update the existing product with the information from the CSV row.

### Requirement: New Product Creation

The system MUST create new products for entries that do not exist in the database.

#### Scenario: Row contains a new product
- GIVEN the background process is reading a CSV row
- WHEN the product `nombre` does NOT exist in the database
- THEN the system MUST create a new product using the provided row data.

### Requirement: Detailed Error Reporting

The system MUST provide a detailed error report if rows contain invalid data.

#### Scenario: Rows with invalid data found
- GIVEN the upload process has finished
- WHEN one or more rows contain invalid data (e.g., non-numeric price, invalid strict station like 'Postres' instead of the allowed ones)
- THEN the system MUST allow the Administrator to download an error CSV
- AND the error CSV MUST contain the original row data plus an additional `motivo_del_error` column explaining the failure.

### Requirement: Final Process Summary

The system MUST display a summary of the bulk upload results upon completion.

#### Scenario: Process completes
- GIVEN the upload process has finished (with or without row errors)
- WHEN the Administrator returns to the bulk upload screen
- THEN the system MUST display a summary: "Carga finalizada. Productos creados: X. Productos actualizados: Y. Errores encontrados: Z."