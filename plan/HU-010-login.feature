Feature: HU-010 Login
  Como usuario del sistema de restaurante
  Quiero iniciar sesión con mis credenciales
  Para acceder al sistema y gestionar pedidos

  Scenario: Usuario inicia sesión con email y password correctos
    Given que el usuario tiene una cuenta registrada
    When el usuario ingresa email y password correctos
    Then el sistema inicia sesión exitosamente
    And guarda el token de autenticación
    And redirige a la vista principal

  Scenario: Usuario intenta login con password incorrecto
    Given que el usuario tiene una cuenta registrada
    When el usuario ingresa email correcto pero password incorrecto
    Then el sistema muestra error "Credenciales inválidas"
    And no inicia sesión

  Scenario: Usuario marca "recordarme" para sesión persistente
    Given que el usuario tiene una cuenta registrada
    When el usuario marca la opción "recordarme"
    And inicia sesión
    Then el sistema guarda token con fecha de expiración
    And la sesión persiste después de cerrar el navegador

  Scenario: Usuario accede con modo demo
    Given que el usuario no tiene cuenta
    When el usuario activa el modo demo
    Then el sistema permite acceso sin autenticación
    And crea una sesión de demo

  Scenario: Login con formato de email inválido
    Given que el usuario quiere iniciar sesión
    When el usuario ingresa un email con formato inválido
    Then el sistema muestra error de formato de correo
    And no inicia sesión

  Scenario: Login con password demasiado corto
    Given que el usuario tiene una cuenta registrada
    When el usuario ingresa password demasiado corto
    Then el sistema muestra error de longitud de password
    And no inicia sesión

  Scenario: Login con rememberMe activo y expiración de token
    Given que el usuario tiene una cuenta registrada
    When el usuario marca "recordarme" y realiza login
    Then el token debe persistir entre sesiones
    And la sesión se mantiene al reabrir el navegador

  Scenario: Login con espacios en email o password
    Given que el usuario tiene una cuenta registrada
    When el usuario introduce email/password con espacios en blanco
    Then el sistema debe limpiar los campos y autenticar correctamente si es válido

  Given el usuario navega a la página de login
  When ingresa credenciales válidas (usuario demo, contraseña demo)
  And pulsa el botón de login
  Then accede al sistema y la sesión se persiste
  And se muestra la vista principal

  Given el usuario navega a la página de login
  When ingresa credenciales inválidas (usuario demo, contraseña incorrecta)
  And pulsa el botón de login
  Then se muestra un mensaje de error
  And no se accede al sistema

  - Script E2E: tests/e2e/login.spec.ts
  - Endpoint: /api/auth/login
  - Datos de prueba: usuario demo, contraseña demo
  - Integración: pipeline CI/CD ejecuta pruebas E2E en contenedor
