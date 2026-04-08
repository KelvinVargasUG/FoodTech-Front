Feature: HU-012 Registro
  Como nuevo usuario del sistema
  Quiero registrarme con mis datos
  Para poder acceder al sistema y gestionar pedidos

  Scenario: Registro exitoso
    Given que el usuario no tiene cuenta
    When el usuario ingresa email, username y password
    And completa el registro
    Then el sistema crea la cuenta
    And inicia sesión automáticamente

  Scenario: Registro con email duplicado
    Given que ya existe una cuenta con ese email
    When el usuario intenta registrarse con ese email
    Then el sistema muestra error
    And no crea la cuenta

  Scenario: Toggle entre login y registro
    Given que está en la página de login
    When el usuario hace click en "Regístrate"
    Then el formulario cambia a modo registro
    And puede completar el registro

  Scenario: Registro con email inválido
    Given que el usuario quiere registrarse
    When el usuario ingresa un email con formato inválido
    Then el sistema muestra error de formato de correo
    And no crea la cuenta

  Scenario: Registro con password débil
    Given que el usuario quiere registrarse
    When el usuario ingresa password débil
    Then el sistema muestra alerta de seguridad de password
    And no crea la cuenta

  Scenario: Registro con campos obligatorios vacíos
    Given que el usuario deja campos obligatorios vacíos
    When intenta registrar
    Then el sistema indica campos obligatorios faltantes

  Scenario: Registro con usuario inválido
    Given que el usuario ingresa username inválido
    When intenta registrar
    Then el sistema muestra validación de username
    And no crea la cuenta
